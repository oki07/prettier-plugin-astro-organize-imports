import { createRequire as req } from 'module'
import type { Options, Parser, ParserOptions, Plugin, Printer } from 'prettier'

const basePlugin = 'prettier-plugin-astro'

async function loadIfExistsESM(name: string) {
  try {
    if (req(import.meta.url).resolve(name)) {
      const mod = await import(name)
      return (mod.default ?? mod) as Plugin
    }
  } catch {
    // Do nothing
  }

  return {
    parsers: {},
    printers: {},
  }
}

async function loadBasePlugins() {
  const mod = await loadIfExistsESM(basePlugin)
  return mod
}

async function resolveEntry<T extends object>(
  entry: unknown,
): Promise<Partial<T>> {
  if (typeof entry === 'function') {
    try {
      return ((await (entry as () => unknown)()) ?? {}) as Partial<T>
    } catch {
      return {}
    }
  }

  return (entry ?? {}) as Partial<T>
}

// `preprocess` has to stay synchronous (#223).
function dropAsyncPreprocess(parser: Partial<Parser>): Partial<Parser> {
  if (parser.preprocess?.constructor.name !== 'AsyncFunction') {
    return parser
  }

  const rest = { ...parser }
  delete rest.preprocess
  return rest
}

async function loadCompatiblePlugins() {
  const plugins = [basePlugin, 'prettier-plugin-tailwindcss']

  const result = await Promise.all(
    plugins.map(async (name) => {
      const mod = await loadIfExistsESM(name)

      return {
        name,
        mod,
        parser: dropAsyncPreprocess(
          await resolveEntry<Parser>(mod.parsers?.astro),
        ),
        printer: await resolveEntry<Printer>(mod.printers?.astro),
      }
    }),
  )

  return result
}

export async function loadPlugin() {
  const base = await loadBasePlugins()
  const compatible = await loadCompatiblePlugins()

  const baseParser = { ...(await resolveEntry<Parser>(base.parsers?.astro)) }

  function maybeResolve(name: string) {
    try {
      return req(import.meta.url).resolve(name)
    } catch {
      return null
    }
  }

  function findEnabledPlugin(
    options: ParserOptions | Options,
    name: string,
    mod: Plugin,
  ) {
    if (!options.plugins) {
      throw new Error(`options.plugins is not defined`)
    }

    const path = maybeResolve(name)

    for (const plugin of options.plugins) {
      if (typeof plugin === 'string') {
        throw new Error(
          `Plugin must be \`prettier.Plugin\`. but got \`string\`: ${plugin}`,
        )
      }

      // options.plugins.*.name == name
      if ('name' in plugin && plugin.name === name) {
        return mod
      }

      // options.plugins.*.name == path
      if ('name' in plugin && plugin.name === path) {
        return mod
      }

      // basically options.plugins.* == mod
      // But that can't work because prettier normalizes plugins which destroys top-level object identity
      if (
        !(plugin instanceof URL) &&
        plugin.parsers &&
        mod.parsers &&
        plugin.parsers === mod.parsers
      ) {
        return mod
      }
    }

    return null
  }

  return {
    parser: baseParser,

    originalParser(options: Options): Partial<Parser> {
      if (!options.plugins) {
        return {}
      }

      const parser: Partial<Parser> = {}

      // Now load parsers from "compatible" plugins if any
      for (const { name, mod, parser: astro } of compatible) {
        if (findEnabledPlugin(options, name, mod)) {
          Object.assign(parser, astro)
        }
      }

      return parser
    },

    originalPrinter(options: Options): Partial<Printer> {
      if (!options.plugins) {
        return {}
      }

      const printer: Partial<Printer> = {}

      for (const { name, mod, printer: astro } of compatible) {
        if (findEnabledPlugin(options, name, mod)) {
          Object.assign(printer, astro)
        }
      }

      return printer
    },
  }
}
