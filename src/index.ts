import type { Parser, Printer, SupportOption } from 'prettier'
import { OrganizeImportsMode } from 'typescript'
import {
  organizeImports,
  organizeImportsInScriptTags,
} from './organize-imports'
import { loadPlugin } from './plugins'

export interface PluginOptions {
  astroOrganizeImportsMode: OrganizeImportsMode
  astroOrganizeImportsInScriptTags: boolean
}

declare module 'prettier' {
  interface RequiredOptions extends PluginOptions {}
}

const plugin = await loadPlugin()

export const parsers: Record<string, Parser> = {
  astro: {
    astFormat: 'astro',
    locStart: (node) => node.position.start.offset,
    locEnd: (node) => node.position.end.offset,

    ...plugin.parser,

    preprocess(code, options) {
      const originalParser = plugin.originalParser(options)

      let result = code
      result = options.astroOrganizeImportsInScriptTags
        ? organizeImportsInScriptTags(result, options)
        : result
      const preprocessed = originalParser.preprocess?.(result, options)
      result = typeof preprocessed === 'string' ? preprocessed : result
      result = organizeImports(result, options.astroOrganizeImportsMode)
      return result
    },

    parse(text, options) {
      const original = plugin.originalParser(options)
      return original.parse?.(text, options) ?? text
    },
  },
}

export const printers: Record<string, Printer> = {
  astro: plugin.printer as Printer,
}

export const options: Record<keyof PluginOptions, SupportOption> = {
  astroOrganizeImportsMode: {
    type: 'choice',
    default: OrganizeImportsMode.All,
    category: 'OrganizeImports',
    description: 'Organize imports mode',
    choices: [
      {
        value: OrganizeImportsMode.All,
        description:
          'Removing unused imports, coalescing imports from the same module, and sorting imports',
      },
      {
        value: OrganizeImportsMode.SortAndCombine,
        description:
          'Coalesce imports from the same module and sorting imports',
      },
      {
        value: OrganizeImportsMode.RemoveUnused,
        description: 'Removing unused imports',
      },
    ],
  },
  astroOrganizeImportsInScriptTags: {
    type: 'boolean',
    default: true,
    category: 'OrganizeImports',
    description: 'Organize imports in script tags',
  },
}
