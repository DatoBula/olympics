const repository = require('../repository')
const printer = require('../printer')

const CHARTS = {
  'medals': repository.getMedalsStats,
  'top-teams': repository.getTeamStats
}

const HEADERS = {
  'medals': ['Year', 'Amount'],
  'top-teams': ['NOC', 'Amount']
}

const FIELDS_REGEX = {
  season: /^(winter|summer)$/,
  year: /^\d{4}$/,
  medal: /^(gold|bronze|silver)$/,
  noc: /^\S{3}$/
}

const REQUIRED_FIELDS = {
  'medals': ['noc', 'season'],
  'top-teams': ['season']
}

function getFilter(params) {
  let filter = {}
  for (let param of params) {
    for (let field of Object.keys(FIELDS_REGEX)) {
      let regex = FIELDS_REGEX[field]
      if (regex.test(param.toLowerCase())) {
        filter[field] = param
      }
    }
  }

  return filter
}

function validateFilter(chartName, filter) {
  if (!REQUIRED_FIELDS[chartName]) throw new Error(`${chartName} chart does not exists.`)
  for (let field of REQUIRED_FIELDS[chartName]) {
    if (!filter[field]) throw new Error(`${field} field is required for chart ${chartName}`)
  }
}

async function parseCommand(chartName, params) {
  let filter = getFilter(params)
  try {
    validateFilter(chartName, filter)
    let data = await CHARTS[chartName](filter)
    printer.print([HEADERS[chartName], ...data])
  } catch (e) {
    printer.printError(e.message)
  }
}

module.exports = {parseCommand}
