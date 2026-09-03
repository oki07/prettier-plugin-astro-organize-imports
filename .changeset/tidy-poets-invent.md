---
'prettier-plugin-astro-organize-imports': patch
---

Stop annotating the printer's `print` and `embed` parameters so the plugin
type-checks against Prettier 3.9, which widened the `print` callback a printer
receives from `(path: AstPath) => Doc` to a selector-based signature. Letting
Prettier's own `Printer` type them contextually keeps the plugin buildable on
every supported 3.x. Runtime behaviour is unchanged.
