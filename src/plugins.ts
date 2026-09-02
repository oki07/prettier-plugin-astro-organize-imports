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

/**
 * A plugin may expose `parsers.astro` / `printers.astro` either as the object
 * itself or as a factory that resolves it on first call --
 * prettier-plugin-tailwindcss switched to a factory in 0.8. `Object.assign`
 * over a bare function copies nothing, so the plugin would be dropped without a
 * trace. Resolve it here, where we are still allowed to await.
 */
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

/**
 * Our `preprocess` has to stay synchronous, because Prettier 3.6 does not await
 * it (#223), so an async one from a compatible plugin cannot be honoured.
 * prettier-plugin-tailwindcss 0.8 declares one, but its `astro` entry registers
 * no compatible plugins and delegates to prettier-plugin-astro, which has no
 * `preprocess` of its own -- the shim resolves to "return the code unchanged".
 * Dropping the key here rather than after merging keeps a synchronous
 * `preprocess` from an earlier plugin in place. Class sorting is unaffected: it
 * happens in `parse`.
 */
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
