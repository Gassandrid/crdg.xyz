import assert from "node:assert/strict"
import test from "node:test"
import {
  ApiError,
  createReviewPullRequest,
  Env,
  handleRequest,
  validateImageContents,
  validateSubmissionForm,
  WikiSubmission,
} from "./index"

const env: Env = {
  GITHUB_TOKEN: "test-token",
  TURNSTILE_SECRET_KEY: "test-secret",
  GITHUB_OWNER: "Gassandrid",
  GITHUB_REPO: "crdg.xyz",
  GITHUB_BASE_BRANCH: "v5",
  ALLOWED_ORIGINS: "https://crdg.xyz",
  TURNSTILE_HOSTNAMES: "crdg.xyz",
}

test("health exposes the deployed review branch without exposing secrets", async () => {
  const response = await handleRequest(new Request("https://edit.crdg.xyz/api/health"), env)
  assert.equal(response.status, 200)
  assert.equal(response.headers.get("Cache-Control"), "no-store")
  assert.deepEqual(await response.json(), {
    status: "ok",
    githubBaseBranch: "v5",
    githubConfigured: true,
    turnstileConfigured: true,
  })
})

function response(body: unknown, status = 200): Response {
  return new Response(body === undefined ? null : JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  })
}

const readinessRequest = () => new Request("https://edit.crdg.xyz/api/health?check=github")

test("readiness verifies the deployed token and branch with a read-only GitHub request", async (t) => {
  const github = t.mock.method(
    globalThis,
    "fetch",
    async (input: string | URL | Request, init?: RequestInit) => {
      assert.equal(
        String(input),
        "https://api.github.com/repos/Gassandrid/crdg.xyz/git/ref/heads/v5",
      )
      assert.equal(init?.method ?? "GET", "GET")
      assert.equal(new Headers(init?.headers).get("Authorization"), "Bearer test-token")
      assert.ok(init?.signal instanceof AbortSignal)
      return response({ object: { sha: "base-commit" } })
    },
  )
  const result = await handleRequest(readinessRequest(), env)
  assert.equal(result.status, 200)
  assert.equal(result.headers.get("Cache-Control"), "no-store")
  assert.deepEqual(await result.json(), {
    status: "ok",
    githubBaseBranch: "v5",
    githubConfigured: true,
    turnstileConfigured: true,
    githubAccessible: true,
  })
  assert.equal(github.mock.callCount(), 1)
})

for (const status of [401, 403, 404]) {
  test(`readiness fails when GitHub returns ${status} despite a configured token`, async (t) => {
    t.mock.method(globalThis, "fetch", async () => response({ message: "Rejected" }, status))
    const result = await handleRequest(readinessRequest(), env)
    assert.equal(result.status, 503)
    assert.deepEqual(await result.json(), {
      status: "unavailable",
      githubBaseBranch: "v5",
      githubConfigured: true,
      turnstileConfigured: true,
      githubAccessible: false,
      code: status === 404 ? "github_error" : "github_auth",
    })
  })
}

test("readiness handles a GitHub timeout without exposing the upstream error", async (t) => {
  t.mock.method(globalThis, "fetch", async () => {
    throw new DOMException("sensitive upstream detail", "TimeoutError")
  })
  const result = await handleRequest(readinessRequest(), env)
  assert.equal(result.status, 503)
  const body = (await result.json()) as { code: string; githubAccessible: boolean }
  assert.equal(body.code, "github_unreachable")
  assert.equal(body.githubAccessible, false)
  assert.ok(!JSON.stringify(body).includes("sensitive upstream detail"))
})

test("readiness does not call GitHub when either secret is missing", async (t) => {
  const github = t.mock.method(globalThis, "fetch", async () => {
    throw new Error("Unexpected GitHub request")
  })
  for (const key of ["GITHUB_TOKEN", "TURNSTILE_SECRET_KEY"]) {
    const result = await handleRequest(readinessRequest(), { ...env, [key]: "" })
    assert.equal(result.status, 503)
    const body = (await result.json()) as { code: string }
    assert.equal(body.code, "not_configured")
  }
  assert.equal(github.mock.callCount(), 0)
})

function submission(images: File[] = []): WikiSubmission {
  return {
    operation: "edit",
    pagePath: "content/Items/Test Page.md",
    pageTitle: "Test Page",
    baseSha: "a".repeat(40),
    lineEnding: "lf",
    content: `## Updated\n\nNew facts.${images.map((image) => `\n\n![[${image.name}]]`).join("")}`,
    summary: "Corrected the item description.",
    contributor: "Example editor",
    discord: "example_user",
    submissionId: "12345678-1234-1234-1234-1234567890ab",
    images,
  }
}

test("validates an edit and its referenced images", () => {
  const image = new File([new Uint8Array([1, 2, 3])], "wiki-1760000000000-acde1234-shot.png", {
    type: "image/png",
  })
  const form = new FormData()
  const candidate = submission([image])
  Object.entries(candidate).forEach(([key, value]) => {
    if (key !== "images") form.set(key, String(value))
  })
  form.set("website", "")
  form.append("images", image)

  const parsed = validateSubmissionForm(form)
  assert.equal(parsed.pagePath, candidate.pagePath)
  assert.equal(parsed.images.length, 1)
  assert.equal(parsed.images[0].name, image.name)
})

test("restores the page line endings after multipart form normalization", () => {
  const form = new FormData()
  const candidate = submission()
  Object.entries(candidate).forEach(([key, value]) => {
    if (key !== "images") form.set(key, String(value))
  })
  form.set("content", "first\r\nsecond\r\n")
  form.set("website", "")

  assert.equal(validateSubmissionForm(form).content, "first\nsecond\n")
  form.set("lineEnding", "crlf")
  assert.equal(validateSubmissionForm(form).content, "first\r\nsecond\r\n")
})

test("rejects paths outside the public content tree", () => {
  const form = new FormData()
  const candidate = submission()
  Object.entries(candidate).forEach(([key, value]) => {
    if (key !== "images") form.set(key, String(value))
  })
  form.set("pagePath", "content/../quartz.config.ts.md")
  form.set("website", "")
  assert.throws(() => validateSubmissionForm(form), ApiError)
})

test("rejects a non-image payload with a trusted-looking extension", async () => {
  const image = new File(["not actually a png"], "wiki-1760000000000-acde1234-shot.png", {
    type: "image/png",
  })
  await assert.rejects(
    () => validateImageContents([image]),
    (error: unknown) => error instanceof ApiError && error.code === "invalid_image",
  )
})

test("creates one commit containing Markdown and images, then opens a PR", async () => {
  const image = new File([new Uint8Array([1, 2, 3])], "wiki-1760000000000-acde1234-shot.png", {
    type: "image/png",
  })
  const calls: Array<{ url: string; init?: RequestInit }> = []
  const queued = [
    response({ object: { sha: "base-commit" } }),
    response({ sha: "a".repeat(40) }),
    response({ tree: { sha: "base-tree" } }),
    response({ sha: "markdown-blob" }, 201),
    response({ sha: "image-blob" }, 201),
    response({ sha: "new-tree" }, 201),
    response({ sha: "new-commit" }, 201),
    response({ object: { sha: "new-commit" } }, 201),
    response({ number: 42, html_url: "https://github.com/Gassandrid/crdg.xyz/pull/42" }, 201),
  ]
  const githubFetch = async (input: string | URL | Request, init?: RequestInit) => {
    calls.push({ url: String(input), init })
    const next = queued.shift()
    assert.ok(next, `Unexpected GitHub request to ${input}`)
    return next
  }

  const pull = await createReviewPullRequest(env, submission([image]), githubFetch)
  assert.equal(pull.number, 42)
  assert.equal(queued.length, 0)

  const treeCall = calls.find((call) => call.url.endsWith("/git/trees"))
  assert.ok(treeCall)
  const treeBody = JSON.parse(String(treeCall.init?.body)) as {
    base_tree: string
    tree: Array<{ path: string; sha: string }>
  }
  assert.equal(treeBody.base_tree, "base-tree")
  assert.deepEqual(
    treeBody.tree.map((entry) => entry.path),
    ["content/Items/Test Page.md", `content/Attachments/${image.name}`],
  )

  const pullCall = calls.at(-1)
  assert.ok(pullCall?.url.endsWith("/pulls"))
  const pullBody = JSON.parse(String(pullCall!.init?.body)) as {
    base: string
    head: string
    title: string
  }
  assert.equal(pullBody.base, "v5")
  assert.match(pullBody.head, /^wiki-edit\/test-page-/)
  assert.equal(pullBody.title, "Wiki edit: Test Page")
})

test("stops before creating objects when the published page is newer", async () => {
  const queued = [response({ object: { sha: "base-commit" } }), response({ sha: "b".repeat(40) })]
  const githubFetch = async () => queued.shift()!

  await assert.rejects(
    () => createReviewPullRequest(env, submission(), githubFetch),
    (error: unknown) =>
      error instanceof ApiError && error.status === 409 && error.code === "stale_page",
  )
  assert.equal(queued.length, 0)
})

test("creates a new page only when its target path is unused", async () => {
  const candidate = { ...submission(), operation: "create" as const, baseSha: "" }
  const calls: string[] = []
  const queued = [
    response({ object: { sha: "base-commit" } }),
    response({ message: "Not Found" }, 404),
    response({ tree: { sha: "base-tree" } }),
    response({ sha: "markdown-blob" }, 201),
    response({ sha: "new-tree" }, 201),
    response({ sha: "new-commit" }, 201),
    response({ object: { sha: "new-commit" } }, 201),
    response({ number: 43, html_url: "https://github.com/Gassandrid/crdg.xyz/pull/43" }, 201),
  ]
  const githubFetch = async (input: string | URL | Request) => {
    calls.push(String(input))
    return queued.shift()!
  }

  const pull = await createReviewPullRequest(env, candidate, githubFetch)
  assert.equal(pull.number, 43)
  assert.equal(queued.length, 0)
  assert.ok(calls.some((url) => url.includes("/contents/content/Items/Test%20Page.md")))
})

test("rejects a new page when its target path already exists", async () => {
  const candidate = { ...submission(), operation: "create" as const, baseSha: "" }
  const queued = [response({ object: { sha: "base-commit" } }), response({ sha: "b".repeat(40) })]

  await assert.rejects(
    () => createReviewPullRequest(env, candidate, async () => queued.shift()!),
    (error: unknown) =>
      error instanceof ApiError && error.status === 409 && error.code === "page_exists",
  )
})
