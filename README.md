# The CRDG Wiki

Community documentation for Cart Ride Around a 75 KW Diesel Generator, published
at [crdg.xyz](https://crdg.xyz) with Quartz 5. Articles and attachments live in
`content/`; the site layout and plugins are configured in `quartz.config.yaml`.

Use Node 22 and npm 10.9.2 or newer:

```sh
npm ci
npm run install-plugins
npm run typecheck
npm test
npm run editor:check
npm run build
```

`npm run build` installs the committed plugin revisions, applies the Bases card
patch, builds the wiki, writes `public/build-info.json`, and checks the output.
For local browsing, run `npx quartz build --serve` after installing plugins.

GitHub Pages deploys from `v5`. The `github-pages` environment must allow only
the `v5` branch: an old workflow on `v4` otherwise remains capable of replacing
production. The old branch is retained for reference; to roll back, revert the
relevant changes on `v5`. A manual deployment can also be started from the Pages
workflow on `v5`.

Cloudflare enforces HTTP-to-HTTPS redirects for the domain. GitHub's Pages source
setting also points to `v5`; the environment rule enforces which branch may deploy.

The Pages workflow verifies the published commit and homepage scripts/styles:

```sh
npm run site:check -- https://crdg.xyz/ EXPECTED_COMMIT_SHA
```

CI checks types, tests, the editor bundle, and a full wiki build on pull requests.
Dependency updates stay within the current major versions, including Preact 10
required by the plugins. Plugin revisions are pinned in `quartz.lock.json`;
refresh them deliberately and validate the resulting build.

See [editor operations](docs/wiki-editor-operations.md),
[Quartz migration notes](docs/quartz-5-migration.md), and
[technical debt](TECHNICAL_DEBT.md) for maintenance details.
