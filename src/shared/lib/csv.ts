/** CSV 파일을 생성하여 브라우저 다운로드 실행 */
export function downloadCsv(
  filename: string,
  rows: Record<string, unknown>[],
  headers: { key: string; label: string }[],
) {
  const headerRow = headers.map((h) => h.label).join(',')
  const dataRows = rows.map((row) =>
    headers
      .map((h) => `"${String(row[h.key] ?? '').replace(/"/g, '""')}"`)
      .join(','),
  )
  const csv = [headerRow, ...dataRows].join('\n')
  // BOM(\uFEFF) 포함하여 엑셀 한글 깨짐 방지
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
