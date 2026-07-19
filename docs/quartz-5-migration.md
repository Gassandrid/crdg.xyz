# Quartz 5 migration

The wiki now runs on Quartz 5 from the `v5` branch. The old `v4` branch remains available as a rollback point.

## CRDG-specific pieces

- `quartz.config.yaml` replaces the v4 TypeScript config and layout files.
- `quartz.ts` adds the site-local `WikiEditor` to content pages and replaces Quartz's initially loaded page dispatcher with the resulting layout.
- The editor UI remains in `quartz/components/WikiEditor.tsx`, with its client script and stylesheet beside it.
- The editor Worker targets `v5`, so contributor submissions open pull requests against the deployed wiki branch.
- New-page templates are discovered automatically from `content/Toolkits and Templates/Page Templates/`. Each template owns its class, display metadata, and preferred destination folder in YAML frontmatter.
- GitHub Pages and editor workflows trigger from `v5`.

## Obsidian Bases

The `github:quartz-community/bases-page` plugin is enabled and pinned in `quartz.lock.json`. Add `.base` files anywhere under `content/`; Quartz renders them as database-style pages.

Component notes are flat files directly under `content/Components/`. Every component has `class: component` and exactly one acquisition tag: `components/alien`, `components/component-machine`, `components/manifest`, or `components/miscellaneous`. The home-page card Base groups by those tags. Add an `image` property containing the attachment filename (without `![[...]]`) to supply its cover.

Quartz's current Bases card renderer does not display `groupBy` headings, so `scripts/patch-bases-card-groups` applies the small pinned compatibility patch after plugin installation in CI. Remove that patch when the upstream plugin gains grouped cards.

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

1. Add a Markdown file under `content/Toolkits and Templates/Page Templates/`.
2. Give it a `class` and `defaultLocation`. Optional `templateName` and `templateDescription` properties control how it appears in the editor.
3. Put the initial page frontmatter and body in that file. `class` remains on created pages; `defaultLocation`, `templateName`, and `templateDescription` are editor-only and are removed from the new page source.
4. Build the site and confirm that changing the template resets the draft only after confirmation and that changing the title retains the preferred folder. The suggested path remains editable.

Example:

```yaml
---
title: New person
class: person
defaultLocation: Players
templateDescription: Player profile and creations.
tags:
  - person
---
```
