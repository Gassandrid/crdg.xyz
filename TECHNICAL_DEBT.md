# Technical debt

- **Upstream glob parser advisory (2026-10-14).** The root npm audit still
  reports four high findings along `globby → fast-glob → micromatch → braces`.
  `braces@3.0.3` is the latest published version and is affected by
  [GHSA-vfj7-8cjw-p6xm](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm).
  These packages run in the build/development tools, not the published static
  website. Do not use the suggested downgrade to globby 7 or force incompatible
  overrides. Exit: update to a patched upstream chain and pass types, tests,
  and the full build; confirm the findings disappear from `npm audit`.
- **GitHub Pages HTTPS enforcement.** HTTPS works through Cloudflare, but
  GitHub's Pages API rejects `https_enforced: true` with “The certificate does
  not exist yet.” Its current setting remains false. Cloudflare's
  `always_use_https` is enabled and handles the public redirect. Exit: verify
  the custom domain certificate at the origin and enable HTTPS enforcement
  in Pages as well.
- **Bases grouped-card compatibility patch.** The pinned plugin needs
  `patches/bases-page-card-groups.patch`, applied by `npm run install-plugins`.
  Exit: adopt an upstream release that renders grouped cards and image embeds,
  verify the four homepage Bases, then remove the patch and helper.
