let [,, chart_name, ...params] = process.argv;

console.log(chart_name, params)

require('./printer')([["NOC", "Amount"], ["USA", 50], ["RUS", 30], ["UGA", 10]]);