const express = require('express')
const app = express()

app.use(express.json())

const path = require('path')

const {open} = require('sqlite')
const sqlite3 = require('sqlite3')

let dbPath = path.join(__dirname, 'cricketMatchDetails.db')

let db = null

let initalizeDBandServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log('Server Started')
    })
  } catch (e) {
    console.log(`Error : "${e.message}"`)
  }
}

module.exports = app

initalizeDBandServer()

let convertObjProp = givenValue => {
  return {
    playerId: givenValue.player_id,
    playerName: givenValue.player_name,
  }
}

// API 1

app.get('/players/', async (request, response) => {
  const getTableQuery = `SELECT * FROM player_details`
  let getTable = await db.all(getTableQuery)
  response.send(getTable.map(eachValue => convertObjProp(eachValue)))
})

// API 2

app.get('/players/:playerId/', async (request, response) => {
  let {playerId} = request.params
  const getSingleValueQuery = `SELECT player_id as playerId,player_name as playerName FROM player_details WHERE player_id = ${playerId};`
  let getSingleValue = await db.get(getSingleValueQuery)
  response.send(getSingleValue)
})

// API 3

app.put('/players/:playerId', async (request, response) => {
  let {playerId} = request.params
  let {playerName} = request.body
  const updateSingleValueQuery = `UPDATE player_details
  SET player_name = "${playerName}"
  WHERE player_id = ${playerId};`
  let updateSingleValue = await db.run(updateSingleValueQuery)
  response.send('Player Details Updated')
})

// API 4
app.get('/matches/:matchId/', async (request, response) => {
  let {matchId} = request.params
  const matchDetailsQuery = `SELECT match_id as matchId,match,year FROM match_details WHERE match_id = ${matchId};`
  let matchDetails = await db.get(matchDetailsQuery)
  response.send(matchDetails)
})

// API 5
app.get('/players/:playerId/matches', async (request, response) => {
  let {playerId} = request.params
  const matchesDetailQuery = `SELECT match_id as matchId,match,year FROM match_details NATURAL JOIN player_match_score WHERE player_match_score.player_id = ${playerId};`
  let matchDetails = await db.all(matchesDetailQuery)
  response.send(matchDetails)
})

// API 6
app.get('/matches/:matchId/players/', async (request, response) => {
  let {matchId} = request.params
  const playerMatchesQuery = `SELECT * FROM player_match_score INNER JOIN player_details ON player_details.player_id = player_match_score.player_id WHERE player_match_score.match_id = ${matchId};`
  let playerMatch = await db.all(playerMatchesQuery)
  response.send(playerMatch.map(eachValue => convertObjProp(eachValue)))
})

// API 7

app.get('/players/:playerId/playerScores', async (request, response) => {
  let {playerId} = request.params
  const returnSelectedQuery = `SELECT player_id AS playerId,player_name AS playerName,SUM(score) AS totalScore,SUM(fours) AS totalFours,SUM(sixes) AS totalSixes FROM player_details NATURAL JOIN player_match_score WHERE player_match_score.player_id = ${playerId};`
  let returnSelectedValue = await db.all(returnSelectedQuery)
  response.send(returnSelectedValue[0])
})
