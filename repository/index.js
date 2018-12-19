const sqlite = require('../utils/sqlite')

const SEASONS = {
  summer: 0,
  winter: 1
}

const MEDALS = {
  gold: 1,
  silver: 2,
  bronze: 3
}

function getTeamStats(filter) {
  let {season, year, medal} = filter
  let params = [SEASONS[season.toLowerCase()]]
  if (year) params.push(parseInt(year))
  if (medal) params.push(MEDALS[medal.toLowerCase()])

  let sql = `select t.noc_name, count(*) as cnt
                      from results r,
                           teams t,
                           athletes a,
                           games g
                      where a.team_id = t.id
                        and r.athlete_id = a.id
                        and g.id = r.game_id
                        and g.season = ?
                        ${year ? 'and g.year = ?\n' : '\n'}
                        ${medal ? 'and r.medal > ?\n' : '\n'}
                      group by t.noc_name`

  return sqlite.promisedGetMany(`${sql} 
                      having cnt > (select avg(cnt) from (${sql}))
                      order by cnt desc`, [...params, ...params])
    .then(rows => rows.map(row => [row.noc_name, row.cnt]))
}

function getMedalsStats(filter) {
  let {noc, season, medal} = filter
  let params = [noc.toUpperCase(), SEASONS[season.toLowerCase()]]
  if (medal) params.push(MEDALS[medal.toLowerCase()])

  let sql = `select distinct g.year, ifnull(a.cnt, 0) as cnt
              from games g
              left outer join (select g.year, count(*) as cnt
                        from results r,
                             teams t,
                             athletes a,
                             games g
                        where a.team_id = t.id
                          and r.athlete_id = a.id
                          and g.id = r.game_id
                          and t.noc_name = ?
                          and g.season = ?
                          ${medal ? 'and r.medal = ?\n' : '\n'}
                        group by g.year) as a on a.year = g.year
              order by g.year desc`

  return sqlite.promisedGetMany(sql, params).then(rows => rows.map(row => [row.year, row.cnt]))
}

module.exports = {getTeamStats, getMedalsStats}
