/**
 * The configuration the README recommends: this plugin on its own, without
 * `prettier-plugin-astro`. The normal suite cannot cover it, because that
 * package is always present here as a devDependency.
 *
 * The temporary project has to live outside the repository, or Node resolves
 * the package we are deliberately leaving out from our own node_modules.
 */
import { spawnSync } from 'child_process'
import {
  copyFileSync,
  mkdirSync,
  mkdtempSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from 'fs'
import { tmpdir } from 'os'
import path from 'path'
import { fileURLToPath } from 'url'

const repo = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const dir = mkdtempSync(
  path.join(tmpdir(), 'astro-organize-imports-standalone-'),
)

try {
  const nodeModules = path.join(dir, 'node_modules')
  mkdirSync(path.join(nodeModules, '@astrojs'), { recursive: true })

  // The bundle's only external runtime dependency.
  symlinkSync(
    path.join(repo, 'node_modules/@astrojs/compiler'),
    path.join(nodeModules, '@astrojs/compiler'),
    'dir',
  )

  const pkgDir = path.join(
    nodeModules,
    'prettier-plugin-astro-organize-imports',
  )
  mkdirSync(path.join(pkgDir, 'dist'), { recursive: true })
  writeFileSync(
    path.join(pkgDir, 'package.json'),
    JSON.stringify({
      name: 'prettier-plugin-astro-organize-imports',
      version: '0.0.0-standalone-smoke',
      type: 'module',
      main: 'dist/index.mjs',
      exports: { '.': './dist/index.mjs' },
    }),
  )
  copyFileSync(
    path.join(repo, 'dist/index.mjs'),
    path.join(pkgDir, 'dist/index.mjs'),
  )

  const input = [
    '---',
    "import Beta from './Beta.astro'",
    "import Alpha from './Alpha.astro'",
    '---',
    '',
    '<Alpha />',
    '<Beta />',
    '',
  ].join('\n')

  const expected = [
    '---',
    "import Alpha from './Alpha.astro'",
    "import Beta from './Beta.astro'",
    '---',
    '',
    '<Alpha />',
    '<Beta />',
  ].join('\n')

  writeFileSync(
    path.join(dir, 'run.mjs'),
    [
      `import prettier from ${JSON.stringify(path.join(repo, 'node_modules/prettier/index.mjs'))}`,
      `const input = ${JSON.stringify(input)}`,
      `const out = await prettier.format(input, {`,
      `  semi: false,`,
      `  singleQuote: true,`,
      `  printWidth: 9999,`,
      `  parser: 'astro',`,
      `  plugins: [${JSON.stringify(path.join(pkgDir, 'dist/index.mjs'))}],`,
      `})`,
      `process.stdout.write(out)`,
    ].join('\n'),
  )

  const result = spawnSync(process.execPath, [path.join(dir, 'run.mjs')], {
    cwd: dir,
    encoding: 'utf8',
  })

  if (result.status !== 0) {
    console.error(result.stderr)
    throw new Error('formatting failed without prettier-plugin-astro installed')
  }

  const actual = result.stdout.trim()
  if (actual !== expected) {
    console.error('--- expected ---\n' + expected)
    console.error('--- actual ---\n' + actual)
    throw new Error('standalone output did not match')
  }

  console.log('standalone smoke test passed')
} finally {
  rmSync(dir, { recursive: true, force: true })
}
