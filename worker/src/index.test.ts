import assert from "node:assert/strict"
import test from "node:test"
import {
  ApiError,
  createReviewPullRequest,
  Env,
  validateImageContents,
  validateSubmissionForm,
  WikiSubmission,
} from "./index"

const env: Env = {
  GITHUB_TOKEN: "test-token",
  TURNSTILE_SECRET_KEY: "test-secret",
  GITHUB_OWNER: "Gassandrid",
  GITHUB_REPO: "crdg.xyz",
  GITHUB_BASE_BRANCH: "v4",
  ALLOWED_ORIGINS: "https://crdg.xyz",
  TURNSTILE_HOSTNAMES: "crdg.xyz",
}

function response(body: unknown, status = 200): Response {
  return new Response(body === undefined ? null : JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  })
}

function submission(images: File[] = []): WikiSubmission {
  return {
    pagePath: "content/Items/Test Page.md",
    pageTitle: "Test Page",
    baseSha: "a".repeat(40),
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
  assert.equal(pullBody.base, "v4")
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
