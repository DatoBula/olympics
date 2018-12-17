const RECT = '█';
const MAX = 100;

function getRects(number, max) {
    let rects = Math.floor((number * MAX / max));
    return RECT.repeat(rects);
}

function print(data) {
    let [header, ...stats] = data;
    console.log(header[0], '\t', header[1]);
    let max = stats[0][1];
    stats.forEach(el => max = el[1] > max ? el[1] : max);
    stats.forEach(el => console.log(el[0], '\t', getRects(el[1], max)))
}

module.exports = print;