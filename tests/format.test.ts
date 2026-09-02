import { version as prettierVersion } from 'prettier'
import { OrganizeImportsMode } from 'typescript'
import { describe, expect, test } from 'vitest'
import { parsers } from '../src'
import { format, readFixture } from './utils'

// prettier-plugin-tailwindcss 0.8 exposes `parsers.astro` as a lazy factory,
// which Prettier only resolves from 3.7 on. Older lines format the file as HTML
// instead -- reproducible with prettier-plugin-astro alone, so there is nothing
// for this plugin to fix. Every other test still runs on the whole matrix.
const [major, minor] = prettierVersion.split('.').map(Number)
const resolvesLazyParsers = major > 3 || (major === 3 && minor >= 7)

const tests = [
  {
    name: 'basic',
    fixtureDir: 'basic',
  },
  {
    name: 'sort and combine',
    fixtureDir: 'sort-and-combine',
    options: {
      astroOrganizeImportsMode: OrganizeImportsMode.SortAndCombine,
    },
  },
  {
    name: 'remove unused',
    fixtureDir: 'remove-unused',
    options: {
      astroOrganizeImportsMode: OrganizeImportsMode.RemoveUnused,
    },
  },
  {
    name: 'function in JSX',
    fixtureDir: 'function-in-jsx',
  },
  {
    name: 'function in JSX 2',
    fixtureDir: 'function-in-jsx-2',
  },
  {
    name: 'function in expression',
    fixtureDir: 'function-in-expression',
  },
  {
    name: 'empty script tag',
    fixtureDir: 'empty-script-tag',
  },
  {
    name: 'inside script tags',
    fixtureDir: 'script-tags',
  },
  {
    name: 'style tag in template',
    fixtureDir: 'style-tag',
  },
  {
    name: 'style tag with attributes (is:global, lang)',
    fixtureDir: 'style-tag-with-attributes',
  },
  {
    name: 'style and script tags in template',
    fixtureDir: 'style-and-script-tags',
  },
  {
    name: 'keeps imports used only by define:vars',
    fixtureDir: 'style-define-vars',
  },
  {
    name: 'keeps imports used only by define:vars in a script tag',
    fixtureDir: 'script-define-vars',
  },
  {
    name: 'keeps define:vars imports when the tag carries other attributes',
    fixtureDir: 'style-define-vars-with-attributes',
  },
  {
    name: 'ignore organize imports inside script tags',
    fixtureDir: 'ignore-organize-imports-in-script-tags',
    options: {
      astroOrganizeImportsInScriptTags: false,
    },
  },
  {
    name: 'multi-byte characters',
    fixtureDir: 'multi-byte-characters',
  },
  {
    name: 'multiple top-level expressions',
    fixtureDir: 'multiple-top-level-expressions',
  },
  {
    name: 'root expressions',
    fixtureDir: 'root-expressions',
  },
  {
    name: 'organize-imports-ignore',
    fixtureDir: 'organize-imports-ignore',
  },
  {
    name: 'tslint:disable:ordered-imports',
    fixtureDir: 'tslint-disable-ordered-imports',
  },
  {
    name: 'with prettier-plugin-astro',
    fixtureDir: 'with-astro-plugin',
    plugins: ['prettier-plugin-astro'],
  },
  {
    name: 'with prettier-plugin-astro and no imports',
    fixtureDir: 'with-astro-plugin-no-imports',
    plugins: ['prettier-plugin-astro'],
  },
  {
    name: 'with prettier-plugin-astro and prettier-plugin-tailwindcss',
    fixtureDir: 'with-astro-and-tailwindcss-plugins',
    plugins: ['prettier-plugin-astro', 'prettier-plugin-tailwindcss'],
    skip: !resolvesLazyParsers,
  },
]

describe('format', () => {
  for (const { name, fixtureDir, options, plugins, skip } of tests) {
    test.skipIf(skip)(name, async () => {
      const { input, expected } = readFixture(fixtureDir)
      const actual = await format(input, { plugins, ...options })
      expect(actual).toEqual(expected)
    })
  }

  // Prettier 3.6.x does not await this hook (#223).
  test('preprocess stays synchronous, so no Promise reaches the parser', () => {
    const { input } = readFixture('with-astro-plugin-no-imports')
    const actual = parsers.astro.preprocess?.(input, {
      astroOrganizeImportsInScriptTags: true,
      astroOrganizeImportsMode: OrganizeImportsMode.All,
    } as never)

    expect(actual).not.toBeInstanceOf(Promise)
    expect(typeof actual).toBe('string')
  })
})
