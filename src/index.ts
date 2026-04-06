import type {
  AstPath,
  Doc,
  Options,
  Parser,
  ParserOptions,
  Printer,
  SupportOption,
} from 'prettier'
import { OrganizeImportsMode } from 'typescript'
import {
  organizeImports,
  organizeImportsInScriptTags,
} from './organize-imports'
import {
  unwrapExpressionWithComponent,
  wrapExpressionWithComponent,
} from './organize-imports/expression'
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

    async preprocess(code, options) {
      const originalParser = plugin.originalParser(options)

      let result = code
      result = wrapExpressionWithComponent(result)
      result = options.astroOrganizeImportsInScriptTags
        ? organizeImportsInScriptTags(result, options)
        : result
      result = (await originalParser.preprocess?.(result, options)) ?? result
      result = organizeImports(result, options.astroOrganizeImportsMode)
      result = unwrapExpressionWithComponent(result)
      return result
    },

    parse(text, options) {
      const original = plugin.originalParser(options)
      return original.parse?.(text, options) ?? text
    },
  },
}

export const printers: Record<string, Printer> = {
  astro: {
    print(path: AstPath, opts: ParserOptions, print: (path: AstPath) => Doc) {
      const original = plugin.originalPrinter(opts)

      if (original.print) {
        return original.print(path, opts, print)
      }

      const { node } = path

      if (typeof node === 'string') {
        return node
      }

      return node.value
    },

    embed(path: AstPath, options: Options) {
      const original = plugin.originalPrinter(options)

      if (original.embed) {
        return original.embed(path, options)
      }

      return null
    },
  },
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
