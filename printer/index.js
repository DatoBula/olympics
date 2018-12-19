const RECT = '█'
const MAX = 100

function getRects(number, max) {
  let rects = Math.ceil((number * MAX / max))
  return rects ? RECT.repeat(rects) : ''
}

function print(data) {
  let [header, ...stats] = data
  console.log(`${header[0]}\t${header[1]}`)
  if (!stats.length) {
    console.log('0')
    return
  }
  let max = stats[0][1]
  stats.forEach(el => max = el[1] > max ? el[1] : max)
  stats.forEach(el => console.log(`${el[0]}\t${getRects(el[1], max)}`))
}

function printError(message) {
  console.error(message)
}

module.exports = {print, printError}
