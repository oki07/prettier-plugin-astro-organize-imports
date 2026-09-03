---
'prettier-plugin-astro-organize-imports': patch
---

Let Prettier's own `Printer` type the printer's `print` and `embed`
parameters instead of annotating them. Prettier 3.9 widened the `print`
callback a printer receives, which broke the build's type check; no single
explicit annotation compiles against both 3.9 and the versions on either side
of it. Runtime behaviour is unchanged.
