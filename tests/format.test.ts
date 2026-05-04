import { OrganizeImportsMode } from 'typescript'
import { describe, expect, test } from 'vitest'
import { format, readFixture } from './utils'

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
    name: 'with prettier-plugin-astro and prettier-plugin-tailwindcss',
    fixtureDir: 'with-astro-and-tailwindcss-plugins',
    plugins: ['prettier-plugin-astro', 'prettier-plugin-tailwindcss'],
  },
]

describe('format', () => {
  for (const { name, fixtureDir, options, plugins } of tests) {
    test(name, async () => {
      const { input, expected } = readFixture(fixtureDir)
      const actual = await format(input, { plugins, ...options })
      expect(actual).toEqual(expected)
    })
  }
})
