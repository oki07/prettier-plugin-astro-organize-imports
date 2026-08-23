---
"prettier-plugin-astro-organize-imports": patch
---

Emit `dist/index.d.ts` during build so the published package ships the type declarations it already advertises via the `types` field (previously consumers got `TS7016`)
