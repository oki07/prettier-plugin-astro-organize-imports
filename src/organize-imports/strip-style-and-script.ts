import { parse } from '@astrojs/compiler/sync'
import type { Node } from '@astrojs/compiler/types'
import { substringByBytes } from './substring'

/**
 * Remove `<style>` and `<script>` elements so their bodies cannot break the
 * TSX the language service parses -- a parse failure silently returns no edits
 * at all (#221). Their `define:vars` expression is re-emitted on its own,
 * because it is the one place these elements reference a frontmatter binding.
 */
export function stripStyleAndScriptElements(code: string): string {
  const { ast } = parse(code, { position: true })

  const edits: Array<{ start: number; end: number; replacement: string }> = []

  function walk(node: Node) {
    if (
      node.type === 'element' &&
      (node.name === 'style' || node.name === 'script')
    ) {
      if (node.position?.start && node.position.end) {
        const defineVars = node.attributes?.find(
          (attribute) =>
            attribute.name === 'define:vars' &&
            attribute.kind === 'expression' &&
            attribute.value,
        )

        edits.push({
          start: node.position.start.offset,
          end: node.position.end.offset,
          replacement: defineVars ? `{(${defineVars.value})}` : '',
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

  if (edits.length === 0) {
    return code
  }

  // Apply back to front so the earlier offsets stay valid.
  edits.sort((a, b) => b.start - a.start)

  let result = code
  for (const { start, end, replacement } of edits) {
    result =
      substringByBytes(result, 0, start) +
      replacement +
      substringByBytes(result, end)
  }
  return result
}
