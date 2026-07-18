# Community wiki editor operations

The public editor removes Git and GitHub from the contributor experience while keeping the
maintainer review process auditable:

1. A reader opens **Edit this page** or **Create a new page**, edits Obsidian Markdown and page
   settings, adds images, and sends one review package.
2. Cloudflare Turnstile is validated server-side by the editor Worker.
3. The Worker verifies that the published page has not changed, creates one commit on a unique
   branch, and opens a pull request against `v4`.
4. Maintainers review the normal Markdown/image diff in GitHub and merge or close it. A merge
   triggers the existing GitHub Pages deployment.

The page settings panel manages the title, destination path for new pages, tags, aliases, and
description. Advanced YAML remains available for less common Quartz frontmatter properties. New
page submissions are rejected if their requested path already exists.

Contributors do not need an account. The GitHub token and Turnstile secret exist only in the
Worker; neither is included in the site bundle.

## One-time production setup

### 1. Create the GitHub credential

Create a fine-grained personal access token restricted to `Gassandrid/crdg.xyz` with:

- **Contents: Read and write**
- **Pull requests: Read and write**

Give it an expiry and record the rotation date. A GitHub App installation token can replace this
later without changing the editor API contract.

### 2. Create the Turnstile widget

Create a managed Cloudflare Turnstile widget named `CRDG wiki editor`. Restrict its hostnames to:

- `crdg.xyz`
- `www.crdg.xyz`

Keep the secret key private. The site key is intentionally public.

### 3. Store Worker secrets

From the repository root:

```bash
npx wrangler secret put GITHUB_TOKEN --config worker/wrangler.jsonc
npx wrangler secret put TURNSTILE_SECRET_KEY --config worker/wrangler.jsonc
```

Paste the fine-grained GitHub token and Turnstile secret when prompted. Never put either value in
`wrangler.jsonc`, GitHub repository variables, or the Quartz source.

### 4. Configure GitHub

Add these repository variables under **Settings → Secrets and variables → Actions → Variables**:

- `TURNSTILE_SITE_KEY`: the public site key from step 2
- `WIKI_EDITOR_API_URL`: `https://edit.crdg.xyz`

The Pages workflow bakes only these public values into the site.

For automatic Worker deployment, add or retain these Actions secrets:

- `CLOUDFLARE_API_TOKEN`: scoped to deploy Workers and manage the `edit.crdg.xyz` custom domain
- `CLOUDFLARE_ACCOUNT_ID`

### 5. Deploy and verify

```bash
npm run editor:test
npm run editor:check
npm run editor:deploy
```

The Worker configuration claims `edit.crdg.xyz` as a custom domain. Verify its read-only status
probe:

```bash
curl https://edit.crdg.xyz/api/health
```

Expected production state:

```json
{ "status": "ok", "githubConfigured": true, "turnstileConfigured": true }
```

Re-run the Pages deployment after setting `TURNSTILE_SITE_KEY`. Open a low-risk wiki page, make a
small correction, submit it, confirm that exactly one pull request appears, inspect its diff, and
close or merge it.

## Local development

Copy `worker/.dev.vars.example` to `worker/.dev.vars`. The example contains Cloudflare's published
always-pass local Turnstile test secret; replace only `GITHUB_TOKEN`, preferably with a token aimed
at a disposable test repository. Local submissions create real branches and pull requests in the
configured GitHub target.

Run the two processes separately:

```bash
npm run editor:dev
WIKI_EDITOR_API_URL=http://localhost:8787 npx quartz build --serve
```

Quartz automatically uses Cloudflare's matching local Turnstile test site key when built with
`--serve`.

## Review and incident handling

- Treat every submission as untrusted. Review both Markdown and binary image changes before merge.
- A stale page returns HTTP `409`; the contributor's IndexedDB draft remains intact.
- Markdown line endings are preserved across multipart submission so ordinary edits remain normal
  line-by-line GitHub diffs rather than whole-file replacements.
- Failed PR creation attempts delete their temporary branch when possible.
- Rotate `GITHUB_TOKEN` immediately if the endpoint behaves unexpectedly, then inspect Worker logs
  and GitHub's token audit trail.
- To stop submissions without removing the editor, delete or rotate the Worker `GITHUB_TOKEN`.
  The editor remains usable for drafting, but the API health probe reports it unconfigured.
- Limits are enforced on both sides: 750 KB Markdown, eight images, 10 MB per image, and 25 MB of
  images per submission. SVG is intentionally rejected.
