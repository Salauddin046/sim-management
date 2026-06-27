/**
 * Sanitizes a value for safe CSV output.
 * Prevents CSV formula injection (Excel/Sheets execute cells starting with = + - @).
 */
export function csvSafe(value) {
  if (value === null || value === undefined) return ''
  const s = String(value)
  // Prefix dangerous formula characters with a single quote
  if (s.length > 0 && ['=', '+', '-', '@', '\t', '\r'].includes(s[0])) {
    return `'${s}`
  }
  return s
}

/**
 * Wraps a value in double-quotes for CSV and escapes internal double-quotes.
 * Use for fields that may contain commas.
 */
export function csvQuote(value) {
  const s = csvSafe(value)
  return `"${s.replace(/"/g, '""')}"`
}

export function buildCSV(headers, rows) {
  return [
    headers.map(csvQuote).join(','),
    ...rows.map((row) => row.map(csvSafe).join(','))
  ].join('\n')
}
