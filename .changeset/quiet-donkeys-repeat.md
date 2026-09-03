---
'prettier-plugin-astro-organize-imports': patch
---

Let Prettier's own `Printer` type the printer's `print` and `embed`
parameters. Prettier 3.9 widened the `print` callback and 4.0 narrows it
again, so no explicit annotation type-checks across the supported range.
Runtime behaviour is unchanged.
