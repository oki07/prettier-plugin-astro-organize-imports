import type { OrganizeImportsMode } from 'typescript'
import { applyTextChanges } from './apply-text-changes'
import {
  ORGANIZE_IMPORTS_IGNORE_COMMENT,
  TSLINT_DISABLE_ORDERED_IMPORTS_COMMENT,
} from './constants'
import { getLanguageService } from './get-language-service'
import { stripStyleAndScriptElements } from './strip-style-and-script'

const FILE_PATH = 'file.tsx'

const FRONTMATTER_REGEX = /^---(\r?\n)([\s\S]*?\r?\n)---(\r?\n)/

/**
 * Organize the given code's imports using TypeScript language service.
 */
function organizeCode(code: string, mode: OrganizeImportsMode) {
  const languageService = getLanguageService(FILE_PATH, code)

  const fileChanges = languageService.organizeImports(
    {
      type: 'file',
      fileName: FILE_PATH,
      mode,
    },
    {},
    {},
  )[0]

  return fileChanges ? applyTextChanges(code, fileChanges.textChanges) : code
}

const TEMPLATE_BOUNDARY = 'const __ASTRO_BOUNDARY__=0\nfunction __(){return(<>'
const TEMPLATE_BOUNDARY_MARKER = 'const __ASTRO_BOUNDARY__=0'
const TEMPLATE_WRAPPER_END = '</>)}'

/**
 * Strip trailing semicolons from import lines if the original code didn't use them.
 * TypeScript 6+ adds semicolons to imports during organizeImports.
 */
function preserveSemicolonStyle(original: string, organized: string) {
  const hasSemicolons = /^import\s.*;\s*$/m.test(original)
  if (hasSemicolons) return organized
  return organized.replace(/^(import\s.*);$/gm, '$1')
}

/**
 * Organize imports in code that may contain Astro frontmatter fences.
 * Strips `---` fences and wraps the template in a synthetic function returning a Fragment
 * to produce valid TSX for the language service, then restores the original structure.
 */
function organize(code: string, mode: OrganizeImportsMode) {
  const match = code.match(FRONTMATTER_REGEX)

  if (!match) {
    return preserveSemicolonStyle(code, organizeCode(code, mode))
  }

  const newline = match[1]
  const frontmatter = match[2]
  const template = code.slice(match[0].length)

  const sanitizedTemplate = stripStyleAndScriptElements(code).slice(
    match[0].length,
  )

  const tsCode =
    frontmatter +
    TEMPLATE_BOUNDARY +
    newline +
    sanitizedTemplate +
    TEMPLATE_WRAPPER_END
  const organized = organizeCode(tsCode, mode)
  const boundaryIdx = organized.indexOf(TEMPLATE_BOUNDARY_MARKER)
  const organizedFrontmatter = preserveSemicolonStyle(
    frontmatter,
    organized.slice(0, boundaryIdx),
  )

  return '---' + newline + organizedFrontmatter + '---' + newline + template
}

/**
 * Organize the code's imports using the `organizeImports` feature of the TypeScript language service API.
 */
export function organizeImports(code: string, mode: OrganizeImportsMode) {
  if (
    code.includes(ORGANIZE_IMPORTS_IGNORE_COMMENT) ||
    code.includes(TSLINT_DISABLE_ORDERED_IMPORTS_COMMENT)
  ) {
    return code
  }

  try {
    const formatted = organize(code, mode)
    return formatted.replace(/(\r\n|\r)/gm, '\n')
  } catch (error) {
    if (process.env.DEBUG) {
      console.error(error)
    }

    return code
  }
}
