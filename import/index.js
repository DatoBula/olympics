const fs = require('fs')
const readline = require('readline')
const path = require('path')
const csv = require('../utils/csv')
const sqlite = require('../utils/sqlite')

const rd = readline.createInterface({
  input: fs.createReadStream(path.join(__dirname, '/athlete_events.csv'))
})

async function saveTeam(team) {
  let row = await sqlite.promisedGet('SELECT * FROM teams WHERE noc_name=?', [team.noc_name])

  if (row) return row.id

  let {lastId} = await sqlite.promisedRun('INSERT INTO teams (name, noc_name) VALUES (?, ?)', [team.name, team.noc_name])

  return lastId
}

async function saveSport(sport) {
  let row = await sqlite.promisedGet('SELECT * FROM sports WHERE name=?', [sport.name])

  if (row) return row.id

  let {lastId} = await sqlite.promisedRun('INSERT INTO sports (name) VALUES (?)', [sport.name])

  return lastId
}

async function saveGame(game) {
  let row = await sqlite.promisedGet('SELECT * FROM games WHERE year=? AND season=? AND city=?', [game.year, game.season, game.city])

  if (row) return row.id

  let {lastId} = await sqlite.promisedRun('INSERT INTO games (year, season, city) VALUES (?, ?, ?)', [game.year, game.season, game.city])

  return lastId
}

async function saveEvent(event) {
  let row = await sqlite.promisedGet('SELECT * FROM events WHERE name=?', [event.name])

  if (row) return row.id

  let {lastId} = await sqlite.promisedRun('INSERT INTO events (name) VALUES (?)', [event.name])

  return lastId
}

async function saveAthlete(athlete) {
  let row = await sqlite.promisedGet('SELECT * FROM athletes WHERE full_name=? AND year_of_birth=? AND sex=? AND params=? AND team_id=?', [athlete.full_name, athlete.year_of_birth, athlete.sex, athlete.params, athlete.team_id])

  if (row) return row.id

  let {lastId} = await sqlite.promisedRun('INSERT INTO athletes (full_name, year_of_birth, sex, params, team_id) VALUES (?, ?, ?, ?, ?)', [athlete.full_name, athlete.year_of_birth, athlete.sex, athlete.params, athlete.team_id])

  return lastId
}

async function saveResult(result) {
  let {lastId} = await sqlite.promisedRun('INSERT INTO results (athlete_id, game_id, sport_id, event_id, medal) VALUES (?, ?, ?, ?, ?)', [result.athlete_id, result.game_id, result.sport_id, result.event_id, result.medal])

  return lastId
}

function getMedalCode(medal) {
  if (medal === 'NA') return 0
  switch (medal) {
    case 'Gold':
      return 1
    case 'Silver':
      return 2
    case 'Bronze':
      return 3
  }

  return 0
}

function trimNameFromBrackets(name) {
  return name.replace(/\(.*?\)/g, '')
}

async function importLine(line) {
  let values = csv.csvToValues(line)
  let [, name, sex, age, height, weight, teamName, nocCode, , year, season, city, sportName, eventName, medal] = values

  if (year === 'Year') return

  let team = {
    name: teamName,
    noc_name: nocCode
  }

  let teamId = await saveTeam(team)

  let sexCode = sex
  let yearOfBirth = age === 'NA' ? null : year - age
  let athleteParams = {}
  if (height !== 'NA') athleteParams.height = height
  if (weight !== 'NA') athleteParams.weight = weight
  let athlete = {
    full_name: trimNameFromBrackets(name),
    year_of_birth: yearOfBirth,
    sex: sexCode === 'M' ? 1 : 0,
    params: JSON.stringify(athleteParams),
    team_id: teamId
  }

  let athleteId = await saveAthlete(athlete)

  let sport = {
    name: sportName
  }

  let sportId = await saveSport(sport)

  let event = {
    name: eventName
  }

  let eventId = await saveEvent(event)

  let seasonCode = season === 'Summer' ? 0 : 1
  let game = {
    year: year,
    season: seasonCode,
    city: city
  }

  let gameId = await saveGame(game)

  let medalCode = getMedalCode(medal)

  let result = {
    athlete_id: athleteId,
    game_id: gameId,
    sport_id: sportId,
    event_id: eventId,
    medal: medalCode
  }

  return saveResult(result)
}

let promise = Promise.resolve()

rd.on('line', async function (line) {
  promise = promise.then(function () {
    return importLine(line)
      .catch(err => console.error(err.stack))
  })
})
