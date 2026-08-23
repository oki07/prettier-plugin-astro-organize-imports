# prettier-plugin-astro-organize-imports

## 0.4.13

### Patch Changes

- [#229](https://github.com/oki07/prettier-plugin-astro-organize-imports/pull/229) [`c87e5c2`](https://github.com/oki07/prettier-plugin-astro-organize-imports/commit/c87e5c25fd41b4d39639b31d49d66f50fd786e59) Thanks [@oki07](https://github.com/oki07)! - Emit `dist/index.d.ts` during build so the published package ships the type declarations it already advertises via the `types` field (previously consumers got `TS7016`)

- [#225](https://github.com/oki07/prettier-plugin-astro-organize-imports/pull/225) [`0de5884`](https://github.com/oki07/prettier-plugin-astro-organize-imports/commit/0de58845122490cf0ccd19c76a9f07abcb146d86) Thanks [@adamchal](https://github.com/adamchal)! - Fix two bugs with `prettier-plugin-astro`: `.astro` files being silently overwritten with `<object></object>` on Prettier 3.6, and imports not being organized in files containing root-level `{expr}` blocks ([#223](https://github.com/oki07/prettier-plugin-astro-organize-imports/issues/223)).

- [#222](https://github.com/oki07/prettier-plugin-astro-organize-imports/pull/222) [`21bf86c`](https://github.com/oki07/prettier-plugin-astro-organize-imports/commit/21bf86c3bd28c497ab42949d252ea34613819aa5) Thanks [@adamchal](https://github.com/adamchal)! - Fix imports silently not being organized when the template contains a `<style>` tag (or a `<script>` tag whose body isn't valid TSX). `<style>`/`<script>` elements are now stripped from the synthetic TSX passed to TypeScript's language service, so frontmatter imports are organized regardless of template contents ([#221](https://github.com/oki07/prettier-plugin-astro-organize-imports/issues/221)).

## 0.4.12

### Patch Changes

- [`1fc0b1e`](https://github.com/oki07/prettier-plugin-astro-organize-imports/commit/1fc0b1eb94f1b5c150e86fcb964d5ffb259e0e55) Thanks [@oki07](https://github.com/oki07)! - Fix support for TypeScript 6 `organizeImports` API behavior change where semicolons are added to import statements

## 0.4.11

### Patch Changes

- [#195](https://github.com/neoki07/prettier-plugin-astro-organize-imports/pull/195) [`17b8dfa`](https://github.com/neoki07/prettier-plugin-astro-organize-imports/commit/17b8dfa62c9326565b83cc02c7d327613ce063e3) Thanks [@neoki07](https://github.com/neoki07)! - No error message when not using compatible plugins

## 0.4.10

### Patch Changes

- [#185](https://github.com/neoki07/prettier-plugin-astro-organize-imports/pull/185) [`1e13b71`](https://github.com/neoki07/prettier-plugin-astro-organize-imports/commit/1e13b714b9993d49ebcdd34f84eae6f3bd15f203) Thanks [@neoki07](https://github.com/neoki07)! - Format code for two top-level expressions correctly

## 0.4.9

### Patch Changes

- [#159](https://github.com/neoki07/prettier-plugin-astro-organize-imports/pull/159) [`56f29ed`](https://github.com/neoki07/prettier-plugin-astro-organize-imports/commit/56f29ed880e680f86b4789193be59330bf1053b0) Thanks [@neoki07](https://github.com/neoki07)! - Add astroOrganizeImportsInScriptTags option

## 0.4.8

### Patch Changes

- [#152](https://github.com/neoki07/prettier-plugin-astro-organize-imports/pull/152) [`0938155`](https://github.com/neoki07/prettier-plugin-astro-organize-imports/commit/0938155c1f551abb71cb80d9439452b6ef514da1) Thanks [@neoki07](https://github.com/neoki07)! - Revert repo url

## 0.4.7

### Patch Changes

- [#149](https://github.com/neoki07/prettier-plugin-astro-organize-imports/pull/149) [`9abd005`](https://github.com/neoki07/prettier-plugin-astro-organize-imports/commit/9abd00510bd417b485c6f5738f042da6e0989f19) Thanks [neoki07](https://github.com/neoki07)! - Fix installation command

## 0.4.6

### Patch Changes

- [#146](https://github.com/neoki07/prettier-plugin-astro-organize-imports/pull/146) [`cd22324`](https://github.com/neoki07/prettier-plugin-astro-organize-imports/commit/cd22324650be8e46b8a9b21d7777150b34f03a19) Thanks [neoki07](https://github.com/neoki07)! - Change repo url
