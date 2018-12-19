function csvToValues(text) {
  if (text.includes('""')) text = text.replace(/""/g, '\\"')
  let validation = /^\s*(?:'[^'\\]*(?:\\[\S\s][^'\\]*)*'|"[^"\\]*(?:\\[\S\s][^"\\]*)*"|[^,'"\s\\]*(?:\s+[^,'"\s\\]+)*)\s*(?:,\s*(?:'[^'\\]*(?:\\[\S\s][^'\\]*)*'|"[^"\\]*(?:\\[\S\s][^"\\]*)*"|[^,'"\s\\]*(?:\s+[^,'"\s\\]+)*)\s*)*$/
  let regex = /(?!\s*$)\s*(?:'([^'\\]*(?:\\[\S\s][^'\\]*)*)'|"([^"\\]*(?:\\[\S\s][^"\\]*)*)"|([^,'"\s\\]*(?:\s+[^,'"\s\\]+)*))\s*(?:,|$)/g
  if (!validation.test(text)) return null
  let values = []
  text.replace(regex, (m0, m1, m2, m3) => {
    if (m1) values.push(m1.replace(/\\'/g, "'"))
    else if (m2) values.push(m2.replace(/\\"/g, '"'))
    else if (m3) values.push(m3)
    return ''
  })
  if (/,\s*$/.test(text)) values.push('')
  return values
}

module.exports = {csvToValues}
