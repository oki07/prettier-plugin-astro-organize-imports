---
"prettier-plugin-astro-organize-imports": patch
---

Fix two bugs with `prettier-plugin-astro`: `.astro` files being silently overwritten with `<object></object>` on Prettier 3.6, and imports not being organized in files containing root-level `{expr}` blocks (#223).
