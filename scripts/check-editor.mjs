import assert from "node:assert/strict"
import { pathToFileURL } from "node:url"

export async function checkEditor() {
  const response = await fetch("https://edit.crdg.xyz/api/health?check=github", {
    signal: AbortSignal.timeout(30_000),
    cache: "no-store",
  })
  const health = await response.json()
  assert.ok(response.ok, `Editor health: HTTP ${response.status} (${health.code ?? health.status})`)
  assert.equal(health.status, "ok")
  assert.equal(health.githubBaseBranch, "v5", "Editor is targeting a different branch")
  assert.equal(health.githubConfigured, true)
  assert.equal(health.turnstileConfigured, true)
  assert.equal(health.githubAccessible, true, "Editor cannot access the GitHub review branch")
  return health
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  // Worker deployments can briefly serve the previous version during propagation.
  for (let attempt = 0; ; attempt++) {
    try {
      console.log("Verified production editor:", await checkEditor())
      break
    } catch (error) {
      if (attempt === 11) throw error
      console.warn(`Waiting for the editor deployment (${attempt + 1}/12): ${error.message}`)
      await new Promise((resolve) => setTimeout(resolve, 5_000))
    }
  }
}
