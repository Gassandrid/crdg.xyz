# Quartz 5 migration

The wiki now runs on Quartz 5 from the `v5` branch. The old `v4` branch remains available as a rollback point.

## CRDG-specific pieces

- `quartz.config.yaml` replaces the v4 TypeScript config and layout files.
- `quartz.ts` adds the site-local `WikiEditor` to content pages and replaces Quartz's initially loaded page dispatcher with the resulting layout.
- The editor UI remains in `quartz/components/WikiEditor.tsx`, with its client script and stylesheet beside it.
- The editor Worker targets `v5`, so contributor submissions open pull requests against the deployed wiki branch.
- New-page templates are registered in `PAGE_TEMPLATES` in `quartz/components/WikiEditor.tsx`. Each entry points to a Markdown template and owns its preferred destination folder.
- GitHub Pages and editor workflows trigger from `v5`.

## Obsidian Bases

The `github:quartz-community/bases-page` plugin is enabled and pinned in `quartz.lock.json`. Add `.base` files anywhere under `content/`; Quartz renders them as database-style pages. A component catalogue can therefore live beside `content/Components/` and query component-note properties without adding custom site code.

After changing plugin entries, refresh the lockfile and verify the site:

```sh
npx quartz plugin install --from-config
npx tsc --noEmit
npm run editor:test
node --max-old-space-size=8192 quartz/bootstrap-cli.mjs build
```

## Deployment cutover

1. Push the local `v5` branch to `origin/v5`.
2. Confirm the Pages, editor check, and editor API workflows pass.
3. In GitHub repository settings, change the default branch from `v4` to `v5`.
4. Submit a small editor test and confirm its pull request targets `v5`.

Do not delete `v4` until the live site and one editor submission have both been verified.

## Adding a page template

1. Add the Markdown source under `content/Toolkits and Templates/`.
2. Add one entry to `PAGE_TEMPLATES` with a stable ID, label, description, preferred folder, and source path.
3. Build the site and confirm that changing the template resets the draft only after confirmation and that changing the title retains the preferred folder.
