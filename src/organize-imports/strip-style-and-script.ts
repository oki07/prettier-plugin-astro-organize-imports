import { parse } from '@astrojs/compiler/sync'
import type { Node } from '@astrojs/compiler/types'
import { substringByBytes } from './substring'

/**
 * Remove `<style>` and `<script>` elements from Astro code.
 *
 * The TypeScript language service's `organizeImports` requires the wrapped
 * template to be valid TSX. Inline CSS (e.g. `div { color: red }`) trips the
 * TSX parser on the unmatched braces, and arbitrary script bodies can also
 * fail to parse. When parsing fails, the language service silently returns no
 * edits, leaving frontmatter imports unsorted (issue #221).
 *
 * Both element types are safe to drop: their contents do not reference
 * frontmatter import bindings (script tags run as separate modules and styles
 * are CSS), so removal cannot mark a frontmatter import as unused.
 */
export function stripStyleAndScriptElements(code: string): string {
  const { ast } = parse(code, { position: true })

  const ranges: Array<{ start: number; end: number }> = []

  function walk(node: Node) {
    if (
      node.type === 'element' &&
      (node.name === 'style' || node.name === 'script')
    ) {
      if (node.position?.start && node.position.end) {
        ranges.push({
          start: node.position.start.offset,
          end: node.position.end.offset,
        })
      }
      return
    }

    if ('children' in node && Array.isArray(node.children)) {
      for (const child of node.children) {
        walk(child)
      }
    }
  }

  walk(ast)

  if (ranges.length === 0) {
    return code
  }

  ranges.sort((a, b) => b.start - a.start)

  let result = code
  for (const { start, end } of ranges) {
    result = substringByBytes(result, 0, start) + substringByBytes(result, end)
  }
  return result
}
