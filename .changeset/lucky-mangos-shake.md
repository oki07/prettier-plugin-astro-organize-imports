---
'prettier-plugin-astro-organize-imports': minor
---

Support Prettier 4. The peer range was `^3.0` only because 3 was the newest
line when it was written, not to rule 4 out; it is now `^3.0 || ^4.0.0-0`, and
CI runs the suite against the `next` dist-tag.
