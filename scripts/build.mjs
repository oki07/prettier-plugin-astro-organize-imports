import esbuild from 'esbuild'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

/**
 * @returns {import('esbuild').Plugin}
 */
function patchCjsInterop() {
  return {
    name: 'patch-cjs-interop',
    setup(build) {
      build.onEnd(async () => {
        let outfile = path.resolve(__dirname, '../dist/index.mjs')

        let content = await fs.promises.readFile(outfile)

        // Prepend `createRequire`
        let code = [
          `import {createRequire} from 'module'`,
          `import {dirname as __global__dirname__} from 'path'`,
          `import {fileURLToPath} from 'url'`,

          // CJS interop fixes
          `const require=createRequire(import.meta.url)`,
          `const __filename=fileURLToPath(import.meta.url)`,
          `const __dirname=__global__dirname__(__filename)`,
        ]

        content = `${code.join('\n')}\n${content}`

        fs.promises.writeFile(outfile, content)
      })
    },
  }
}

const __dirname = path.dirname(fileURLToPath(import.meta.url))

let context = await esbuild.context({
  bundle: true,
  platform: 'node',
  target: 'node18',
  external: ['prettier', '@astrojs/compiler/sync'],
  minify: true,
  entryPoints: [path.resolve(__dirname, '../src/index.js')],
  outfile: path.resolve(__dirname, '../dist/index.mjs'),
  format: 'esm',
  plugins: [patchCjsInterop()],
})

await context.rebuild()

await context.dispose()
