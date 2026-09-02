---
'prettier-plugin-astro-organize-imports': patch
---

Keep prettier-plugin-tailwindcss working after its 0.8 release

0.8 changed `parsers.astro` from a plain object into a factory that resolves the
parser on first call. This plugin merged it with `Object.assign`, which copies
nothing out of a bare function, so Tailwind was dropped without an error and
classes silently stopped being sorted. The factory is now resolved while loading
the plugin, where awaiting is still allowed.

The resolved parser also brings an async `preprocess`. This plugin's own
`preprocess` has to stay synchronous, because Prettier 3.6 does not await it
(#223), so that key is skipped -- for `astro` the hook only delegates to
prettier-plugin-astro, which has no `preprocess`, and sorting happens in `parse`.

Note that prettier-plugin-tailwindcss 0.8 itself needs Prettier 3.7 or later:
on older lines Prettier does not resolve its lazy parsers and formats `.astro`
files as HTML. That reproduces with prettier-plugin-astro alone.
