const path = require('path')
const sqlite3 = require('sqlite3').verbose()
const db = new sqlite3.Database(path.join(__dirname, '../olympic_history.db'))

function promisedRun(sql, params) {
  return new Promise(function (resolve, reject) {
    db.run(sql, params, function (err) {
      if (err) return reject(err)

      resolve({lastId: this.lastID, changes: this.changes})
    })
  })
}

function promisedGet(sql, params) {
  return new Promise(function (resolve, reject) {
    db.get(sql, params, function (err, row) {
      if (err) return reject(err)

      resolve(row)
    })
  })
}

function promisedGetMany(sql, params) {
  return new Promise(function (resolve, reject) {
    db.all(sql, params, function (err, rows) {
      if (err) return reject(err)

      resolve(rows)
    })
  })
}

module.exports = {promisedGet, promisedRun, promisedGetMany}
