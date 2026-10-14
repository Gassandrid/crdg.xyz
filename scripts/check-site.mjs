import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import { resolve, sep } from "node:path"
import { checkEditor } from "./check-editor.mjs"

// Accept a local build directory or a production URL and optional expected SHA.
const target = process.argv[2] || "public"
const expectedCommit = process.argv[3]
const remote = /^https?:\/\//.test(target)
const root = resolve(target)
const base = remote ? new URL(target.endsWith("/") ? target : `${target}/`) : null
async function read(path) {
  if (!remote) {
    const file = resolve(root, path)
    assert.ok(file.startsWith(`${root}${sep}`), `Path escapes build directory: ${path}`)
    return readFileSync(file, "utf8")
  }
  const url = new URL(path, base)
  url.searchParams.set("verify", expectedCommit || Date.now().toString())
  const response = await fetch(url, { signal: AbortSignal.timeout(30_000), cache: "no-store" })
  assert.ok(response.ok, `${url.pathname}: HTTP ${response.status}`)
  return response.text()
}

const info = JSON.parse(await read("build-info.json"))
if (remote) assert.equal(info.branch, "v5", "Production builds must come from v5")
assert.match(info.quartzVersion, /^5\./)
assert.match(info.commit, /^[a-f0-9]{40}$/)
if (expectedCommit)
  assert.equal(info.commit, expectedCommit, "Production is serving a different commit")
const html = await read("index.html")
assert.match(html, /The CRDG Wiki/)
assert.match(html, /bases-cards/, "Homepage Bases cards are missing")
assert.match(html, /wiki-editor/, "Wiki editor is missing")
assert.equal((await read("CNAME")).trim(), "crdg.xyz")
const index = JSON.parse(await read("static/contentIndex.json"))
assert.ok(Object.keys(index).length > 300, "Content index is unexpectedly small")

const assets = new Set(
  [...html.matchAll(/(?:src|href)="([^"?#]+\.(?:css|js))(?:[?#][^"]*)?"/g)]
    .map((match) => match[1])
    .filter((path) => !/^(?:https?:)?\/\//.test(path))
    .map((path) => path.replace(/^\.\//, "")),
)
assert.ok(assets.size > 0, "No local scripts or stylesheets found")
await Promise.all([...assets].map(read))
if (remote) await checkEditor()
console.log(
  `Verified ${target}: Quartz ${info.quartzVersion}, ${info.commit}, ${Object.keys(index).length} indexed pages, ${assets.size} assets`,
)
