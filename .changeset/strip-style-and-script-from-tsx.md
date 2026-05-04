---
"prettier-plugin-astro-organize-imports": patch
---

Fix imports silently not being organized when the template contains a `<style>` tag (or a `<script>` tag whose body isn't valid TSX). `<style>`/`<script>` elements are now stripped from the synthetic TSX passed to TypeScript's language service, so frontmatter imports are organized regardless of template contents (#221).
