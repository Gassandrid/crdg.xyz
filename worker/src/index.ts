export interface Env {
  GITHUB_TOKEN: string
  TURNSTILE_SECRET_KEY: string
  GITHUB_OWNER: string
  GITHUB_REPO: string
  GITHUB_BASE_BRANCH: string
  ALLOWED_ORIGINS: string
  TURNSTILE_HOSTNAMES: string
  ENVIRONMENT?: string
}

export type WikiSubmission = {
  operation: "edit" | "create"
  pagePath: string
  pageTitle: string
  baseSha: string
  lineEnding: "lf" | "crlf"
  content: string
  summary: string
  contributor: string
  discord: string
  submissionId: string
  images: File[]
}

type GitHubFetch = (input: string | URL | Request, init?: RequestInit) => Promise<Response>

type GitHubRef = { object: { sha: string } }
type GitHubContent = { sha: string }
type GitHubCommit = { tree: { sha: string } }
type GitHubObject = { sha: string }
type GitHubPull = { number: number; html_url: string }
type TurnstileResponse = {
  success: boolean
  hostname?: string
  action?: string
  "error-codes"?: string[]
}

const MAX_REQUEST_BYTES = 30 * 1024 * 1024
const MAX_CONTENT_BYTES = 750 * 1024
const MAX_IMAGES = 8
const MAX_IMAGE_BYTES = 10 * 1024 * 1024
const MAX_TOTAL_IMAGE_BYTES = 25 * 1024 * 1024
const IMAGE_TYPES = new Map([
  ["image/png", [".png"]],
  ["image/jpeg", [".jpg", ".jpeg"]],
  ["image/gif", [".gif"]],
  ["image/webp", [".webp"]],
  ["image/avif", [".avif"]],
])

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public code = "invalid_request",
  ) {
    super(message)
  }
}

function list(value: string): string[] {
  return value
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean)
}

function requestOrigin(request: Request, env: Env): string | undefined {
  const origin = request.headers.get("Origin") ?? undefined
  if (!origin && env.ENVIRONMENT === "development") return "*"
  return origin
}

function isAllowedOrigin(origin: string | undefined, env: Env): boolean {
  if (origin === "*" && env.ENVIRONMENT === "development") return true
  return Boolean(origin && list(env.ALLOWED_ORIGINS).includes(origin))
}

function corsHeaders(origin?: string): HeadersInit {
  return {
    "Access-Control-Allow-Origin": origin ?? "null",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400",
    Vary: "Origin",
  }
}

function json(body: unknown, status = 200, origin?: string): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
      ...corsHeaders(origin),
    },
  })
}

function field(form: FormData, name: string): string {
  const value = form.get(name)
  if (typeof value !== "string") throw new ApiError(400, `Missing ${name}.`)
  return value
}

function cleanSingleLine(value: string, max: number): string {
  return value
    .replace(/[\u0000-\u001f\u007f]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, max)
}

function validPagePath(path: string): boolean {
  return (
    path.startsWith("content/") &&
    path.endsWith(".md") &&
    path.length <= 300 &&
    !path.includes("\\") &&
    !path.includes("\0") &&
    !path.split("/").some((part) => part === "" || part === "." || part === "..") &&
    !path.toLowerCase().startsWith("content/private/")
  )
}

function validImageName(name: string): boolean {
  return (
    /^wiki-\d{13}-[a-f0-9]{8}-[A-Za-z0-9][A-Za-z0-9._ -]{0,90}\.[A-Za-z0-9]{2,5}$/.test(name) &&
    !name.includes("..")
  )
}

export function validateSubmissionForm(form: FormData): WikiSubmission {
  const operationValue = form.get("operation")
  const operation = typeof operationValue === "string" && operationValue ? operationValue : "edit"
  const pagePath = field(form, "pagePath")
  const pageTitle = cleanSingleLine(field(form, "pageTitle"), 120)
  const baseSha = field(form, "baseSha").trim().toLowerCase()
  const lineEndingValue = form.get("lineEnding")
  // Default to LF so cached copies of the pre-fix editor remain compatible during deployment.
  const lineEnding = typeof lineEndingValue === "string" && lineEndingValue ? lineEndingValue : "lf"
  const rawContent = field(form, "content")
  const content =
    lineEnding === "crlf" ? rawContent.replace(/\r?\n/g, "\r\n") : rawContent.replace(/\r\n/g, "\n")
  const summary = cleanSingleLine(field(form, "summary"), 500)
  const contributor = cleanSingleLine(field(form, "contributor"), 80)
  const discord = cleanSingleLine(field(form, "discord"), 80)
  const submissionId = field(form, "submissionId").trim().toLowerCase()
  const honeypot = field(form, "website")
  const images = form.getAll("images").filter((entry): entry is File => entry instanceof File)

  if (honeypot !== "") throw new ApiError(400, "Submission rejected.")
  if (operation !== "edit" && operation !== "create")
    throw new ApiError(400, "The submission operation is invalid.")
  if (!validPagePath(pagePath)) throw new ApiError(400, "That wiki page cannot be edited.")
  if (operation === "edit" && !/^[a-f0-9]{40}$/.test(baseSha))
    throw new ApiError(400, "The page version is invalid.")
  if (operation === "create" && baseSha !== "")
    throw new ApiError(400, "A new page cannot have an existing page version.")
  if (lineEnding !== "lf" && lineEnding !== "crlf")
    throw new ApiError(400, "The page line endings are invalid.")
  if (!/^[a-f0-9-]{36}$/.test(submissionId))
    throw new ApiError(400, "The submission ID is invalid.")
  if (pageTitle.length === 0) throw new ApiError(400, "The page title is missing.")
  if (new TextEncoder().encode(content).byteLength > MAX_CONTENT_BYTES) {
    throw new ApiError(413, "This page is too large for the community editor.", "content_too_large")
  }
  if (summary.length < 10) throw new ApiError(400, "Please describe the change in a few words.")
  if (images.length > MAX_IMAGES)
    throw new ApiError(413, `An edit can include up to ${MAX_IMAGES} images.`)

  const names = new Set<string>()
  let imageBytes = 0
  for (const image of images) {
    if (!validImageName(image.name))
      throw new ApiError(400, "An uploaded image has an invalid name.")
    if (names.has(image.name)) throw new ApiError(400, "Two uploaded images have the same name.")
    names.add(image.name)
    const allowedExtensions = IMAGE_TYPES.get(image.type)
    const extension = image.name.match(/\.[A-Za-z0-9]{2,5}$/)?.[0].toLowerCase()
    if (!allowedExtensions || !extension || !allowedExtensions.includes(extension)) {
      throw new ApiError(415, "Use PNG, JPEG, GIF, WebP, or AVIF images.", "unsupported_image")
    }
    if (image.size > MAX_IMAGE_BYTES)
      throw new ApiError(413, "Each image must be 10 MB or smaller.")
    imageBytes += image.size
    if (!content.includes(`![[${image.name}`)) {
      throw new ApiError(400, `The page does not contain the uploaded image ${image.name}.`)
    }
  }
  if (imageBytes > MAX_TOTAL_IMAGE_BYTES) {
    throw new ApiError(413, "Images in one edit can total up to 25 MB.")
  }

  return {
    operation,
    pagePath,
    pageTitle,
    baseSha,
    lineEnding,
    content,
    summary,
    contributor,
    discord,
    submissionId,
    images,
  }
}

function startsWith(bytes: Uint8Array, signature: number[], offset = 0): boolean {
  return signature.every((byte, index) => bytes[offset + index] === byte)
}

export async function validateImageContents(images: File[]): Promise<void> {
  for (const image of images) {
    const header = new Uint8Array(await image.slice(0, 16).arrayBuffer())
    const valid =
      (image.type === "image/png" &&
        startsWith(header, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) ||
      (image.type === "image/jpeg" && startsWith(header, [0xff, 0xd8, 0xff])) ||
      (image.type === "image/gif" &&
        (startsWith(header, [0x47, 0x49, 0x46, 0x38, 0x37, 0x61]) ||
          startsWith(header, [0x47, 0x49, 0x46, 0x38, 0x39, 0x61]))) ||
      (image.type === "image/webp" &&
        startsWith(header, [0x52, 0x49, 0x46, 0x46]) &&
        startsWith(header, [0x57, 0x45, 0x42, 0x50], 8)) ||
      (image.type === "image/avif" &&
        startsWith(header, [0x66, 0x74, 0x79, 0x70], 4) &&
        (startsWith(header, [0x61, 0x76, 0x69, 0x66], 8) ||
          startsWith(header, [0x61, 0x76, 0x69, 0x73], 8)))
    if (!valid)
      throw new ApiError(415, `${image.name} is not a valid ${image.type} image.`, "invalid_image")
  }
}

async function verifyTurnstile(request: Request, form: FormData, env: Env): Promise<void> {
  const token = field(form, "turnstileToken")
  if (!token || token.length > 2048) throw new ApiError(400, "Please complete the verification.")
  if (!env.TURNSTILE_SECRET_KEY) throw new ApiError(503, "Submissions are not configured yet.")

  const body = new FormData()
  body.set("secret", env.TURNSTILE_SECRET_KEY)
  body.set("response", token)
  const ip = request.headers.get("CF-Connecting-IP")
  if (ip) body.set("remoteip", ip)

  const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    body,
  })
  if (!response.ok) throw new ApiError(503, "Verification is temporarily unavailable.")
  const result = (await response.json()) as TurnstileResponse
  const validHostname =
    env.ENVIRONMENT === "development" ||
    Boolean(result.hostname && list(env.TURNSTILE_HOSTNAMES).includes(result.hostname))
  if (!result.success || result.action !== "wiki_edit" || !validHostname) {
    console.warn("Turnstile rejected wiki edit", result["error-codes"] ?? [])
    throw new ApiError(400, "Verification failed. Please try again.", "verification_failed")
  }
}

async function githubRequest<T>(
  env: Env,
  path: string,
  init: RequestInit = {},
  githubFetch: GitHubFetch = fetch,
): Promise<T> {
  const response = await githubFetch(
    `https://api.github.com/repos/${env.GITHUB_OWNER}/${env.GITHUB_REPO}${path}`,
    {
      ...init,
      headers: {
        Accept: "application/vnd.github+json",
        Authorization: `Bearer ${env.GITHUB_TOKEN}`,
        "Content-Type": "application/json",
        "User-Agent": "crdg-wiki-community-editor",
        "X-GitHub-Api-Version": "2026-03-10",
        ...init.headers,
      },
    },
  )

  if (!response.ok) {
    const upstream = await response.text()
    console.error("GitHub request failed", response.status, path, upstream.slice(0, 500))
    if (response.status === 401 || response.status === 403) {
      throw new ApiError(
        503,
        "The maintainer review queue is temporarily unavailable.",
        "github_auth",
      )
    }
    if (response.status === 422) {
      throw new ApiError(
        429,
        "Too many edits were sent recently. Please try again later.",
        "github_limit",
      )
    }
    throw new ApiError(502, "GitHub could not create the review request.", "github_error")
  }

  if (response.status === 204) return undefined as T
  return (await response.json()) as T
}

async function githubContentAt(
  env: Env,
  pagePath: string,
  ref: string,
  githubFetch: GitHubFetch,
): Promise<GitHubContent | undefined> {
  const path = `/contents/${pagePath.split("/").map(encodeURIComponent).join("/")}?ref=${ref}`
  const response = await githubFetch(
    `https://api.github.com/repos/${env.GITHUB_OWNER}/${env.GITHUB_REPO}${path}`,
    {
      headers: {
        Accept: "application/vnd.github+json",
        Authorization: `Bearer ${env.GITHUB_TOKEN}`,
        "User-Agent": "crdg-wiki-community-editor",
        "X-GitHub-Api-Version": "2026-03-10",
      },
    },
  )
  if (response.status === 404) return undefined
  if (!response.ok) {
    const upstream = await response.text()
    console.error("GitHub content lookup failed", response.status, path, upstream.slice(0, 500))
    if (response.status === 401 || response.status === 403) {
      throw new ApiError(
        503,
        "The maintainer review queue is temporarily unavailable.",
        "github_auth",
      )
    }
    throw new ApiError(502, "GitHub could not check the wiki page.", "github_error")
  }
  return (await response.json()) as GitHubContent
}

function bytesToBase64(bytes: Uint8Array): string {
  let binary = ""
  const chunkSize = 0x8000
  for (let offset = 0; offset < bytes.length; offset += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(offset, offset + chunkSize))
  }
  return btoa(binary)
}

async function createBlob(env: Env, bytes: Uint8Array, githubFetch: GitHubFetch): Promise<string> {
  const blob = await githubRequest<GitHubObject>(
    env,
    "/git/blobs",
    {
      method: "POST",
      body: JSON.stringify({ content: bytesToBase64(bytes), encoding: "base64" }),
    },
    githubFetch,
  )
  return blob.sha
}

function branchSlug(submission: WikiSubmission): string {
  const page =
    submission.pagePath
      .split("/")
      .pop()!
      .replace(/\.md$/i, "")
      .normalize("NFKD")
      .replace(/[^A-Za-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .toLowerCase()
      .slice(0, 42) || "page"
  const id = submission.submissionId.replace(/-/g, "").slice(0, 12)
  return `wiki-edit/${page}-${id}`
}

function inlineCode(value: string): string {
  return `\`${value.replace(/`/g, "ˋ")}\``
}

function pullRequestBody(submission: WikiSubmission): string {
  const attribution = submission.contributor || submission.discord
  const lines = [
    "## Community edit",
    "",
    submission.summary
      .split("\n")
      .map((line) => `> ${line}`)
      .join("\n"),
    "",
    `- **Page:** ${inlineCode(submission.pagePath)}`,
    `- **Images:** ${submission.images.length}`,
  ]
  if (attribution)
    lines.push(`- **Submitted by:** ${inlineCode(submission.contributor || "Anonymous")}`)
  if (submission.discord) lines.push(`- **Discord:** ${inlineCode(submission.discord)}`)
  lines.push(
    "",
    "Submitted through the public CRDG wiki editor. Review the file diff before merging.",
  )
  return lines.join("\n")
}

export async function createReviewPullRequest(
  env: Env,
  submission: WikiSubmission,
  githubFetch: GitHubFetch = fetch,
): Promise<GitHubPull> {
  if (!env.GITHUB_TOKEN)
    throw new ApiError(503, "The maintainer review queue is not configured yet.")

  const encodedBranch = env.GITHUB_BASE_BRANCH.split("/").map(encodeURIComponent).join("/")
  const baseRef = await githubRequest<GitHubRef>(
    env,
    `/git/ref/heads/${encodedBranch}`,
    {},
    githubFetch,
  )
  const headSha = baseRef.object.sha
  const currentFile = await githubContentAt(env, submission.pagePath, headSha, githubFetch)
  if (submission.operation === "create" && currentFile) {
    throw new ApiError(
      409,
      "A wiki page already exists at that path. Choose another page path.",
      "page_exists",
    )
  }
  if (submission.operation === "edit" && currentFile?.sha !== submission.baseSha) {
    throw new ApiError(
      409,
      "This page changed while you were editing. Reload it and apply your change again.",
      "stale_page",
    )
  }

  const baseCommit = await githubRequest<GitHubCommit>(
    env,
    `/git/commits/${headSha}`,
    {},
    githubFetch,
  )
  const markdownSha = await createBlob(
    env,
    new TextEncoder().encode(submission.content),
    githubFetch,
  )
  const treeEntries: Array<{ path: string; mode: "100644"; type: "blob"; sha: string }> = [
    { path: submission.pagePath, mode: "100644", type: "blob", sha: markdownSha },
  ]
  for (const image of submission.images) {
    const imageSha = await createBlob(env, new Uint8Array(await image.arrayBuffer()), githubFetch)
    treeEntries.push({
      path: `content/Attachments/${image.name}`,
      mode: "100644",
      type: "blob",
      sha: imageSha,
    })
  }

  const tree = await githubRequest<GitHubObject>(
    env,
    "/git/trees",
    {
      method: "POST",
      body: JSON.stringify({ base_tree: baseCommit.tree.sha, tree: treeEntries }),
    },
    githubFetch,
  )
  const commit = await githubRequest<GitHubObject>(
    env,
    "/git/commits",
    {
      method: "POST",
      body: JSON.stringify({
        message: `wiki: ${submission.operation} ${submission.pageTitle}`,
        tree: tree.sha,
        parents: [headSha],
      }),
    },
    githubFetch,
  )

  const branch = branchSlug(submission)
  let branchCreated = false
  try {
    await githubRequest<GitHubObject>(
      env,
      "/git/refs",
      {
        method: "POST",
        body: JSON.stringify({ ref: `refs/heads/${branch}`, sha: commit.sha }),
      },
      githubFetch,
    )
    branchCreated = true
    return await githubRequest<GitHubPull>(
      env,
      "/pulls",
      {
        method: "POST",
        body: JSON.stringify({
          title: `Wiki ${submission.operation}: ${submission.pageTitle}`,
          head: branch,
          base: env.GITHUB_BASE_BRANCH,
          body: pullRequestBody(submission),
          maintainer_can_modify: true,
        }),
      },
      githubFetch,
    )
  } catch (error) {
    if (branchCreated) {
      await githubRequest<void>(
        env,
        `/git/refs/heads/${branch.split("/").map(encodeURIComponent).join("/")}`,
        { method: "DELETE" },
        githubFetch,
      ).catch((cleanupError) =>
        console.error("Could not clean up failed wiki edit branch", cleanupError),
      )
    }
    throw error
  }
}

async function handleSubmission(request: Request, env: Env, origin: string): Promise<Response> {
  const declaredLength = Number(request.headers.get("Content-Length") ?? "0")
  if (declaredLength > MAX_REQUEST_BYTES)
    throw new ApiError(413, "This edit is too large to submit.")

  const form = await request.formData().catch(() => {
    throw new ApiError(400, "The edit form could not be read.")
  })
  await verifyTurnstile(request, form, env)
  const submission = validateSubmissionForm(form)
  await validateImageContents(submission.images)
  const pull = await createReviewPullRequest(env, submission)
  return json({ ok: true, reviewNumber: pull.number, reviewUrl: pull.html_url }, 201, origin)
}

export async function handleRequest(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url)
  const origin = requestOrigin(request, env)

  if (request.method === "OPTIONS") {
    if (!isAllowedOrigin(origin, env)) return json({ error: "Origin not allowed." }, 403)
    return new Response(null, { status: 204, headers: corsHeaders(origin) })
  }

  if (request.method === "GET" && url.pathname === "/api/health") {
    return json({
      status: "ok",
      githubConfigured: Boolean(env.GITHUB_TOKEN),
      turnstileConfigured: Boolean(env.TURNSTILE_SECRET_KEY),
    })
  }

  if (request.method !== "POST" || url.pathname !== "/api/submissions") {
    return json({ error: "Not found." }, 404, isAllowedOrigin(origin, env) ? origin : undefined)
  }
  if (!isAllowedOrigin(origin, env)) return json({ error: "Origin not allowed." }, 403)

  try {
    return await handleSubmission(request, env, origin!)
  } catch (error) {
    if (error instanceof ApiError)
      return json({ error: error.message, code: error.code }, error.status, origin)
    console.error("Unexpected wiki editor error", error)
    return json({ error: "The edit could not be submitted. Please try again." }, 500, origin)
  }
}

export default {
  fetch(request: Request, env: Env): Promise<Response> {
    return handleRequest(request, env)
  },
}
