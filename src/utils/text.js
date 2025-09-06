// Shared text utilities
// - stripHtmlToText: convert possibly-HTML content into safe plain text for previews

export function stripHtmlToText(html) {
  if (!html || typeof html !== 'string') return ''
  try {
    // Prefer DOMParser when available (browser environment)
    const doc = new DOMParser().parseFromString(String(html), 'text/html')
    const text = doc.body ? doc.body.textContent || '' : ''
    return text.replace(/\s+/g, ' ').trim()
  } catch (e) {
    // Fallback: simple tag strip if DOMParser is not available
    return String(html).replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
  }
}

// Optional helper to clamp length without breaking words (unused now but kept for future)
export function clampText(text, max = 200) {
  if (typeof text !== 'string') return ''
  const t = text.trim()
  if (t.length <= max) return t
  const slice = t.slice(0, max)
  const lastSpace = slice.lastIndexOf(' ')
  return (lastSpace > 0 ? slice.slice(0, lastSpace) : slice) + '…'
}
