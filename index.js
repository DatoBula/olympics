const cmd = require('./cmd')

let [, , chartName, ...params] = process.argv

cmd.parseCommand(chartName, params)
