const express = require("express");
const app = express();
const path = require("path");
const sqlite3 = require("sqlite3");
const { open } = require("sqlite");
app.use(express.json());
const dbPath = path.join(__dirname, "cricketMatchDetails.db");
const initializeAndDbServer = async () => {
  try {
    database = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3001, () => {
      console.log("Server is running at: https://localhost:3001/");
    });
  } catch (e) {
    console.log(`DB Error:${e.message}`);
    process.exit(1);
  }
};
initializeAndDbServer();

const convertPlayerIntoResponseObject = (obj) => {
  return {
    playerId: obj.player_id,
    playerName: obj.player_name,
  };
};

const convertMatchDetailsIntoResponseObject = (obj) => {
  return {
    matchId: obj.match_id,
    match: obj.match,
    year: obj.year,
  };
};

//API 1
app.get("/players/", async (request, response) => {
  const getPlayers = `SELECT * FROM player_details;`;
  const playerArr = await database.all(getPlayers);
  response.send(playerArr.map((each) => convertPlayerIntoResponseObject(each)));
});
//API 2

app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const getPlayer = `SELECT * FROM player_details WHERE player_id=${playerId};`;
  const player = await database.get(getPlayer);
  response.send(convertPlayerIntoResponseObject(player));
});
//API 3

app.put("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const { playerName } = request.body;
  const updatePlayer = `UPDATE player_details SET 
    player_name = "${playerName}"
    WHERE player_id = ${playerId};`;
  await database.run(updatePlayer);
  response.send("Player Details Updates");
});

//API 4
app.get("/matches/:matchId/", async (request, response) => {
  const { matchId } = request.params;
  const matchDetails = `SELECT * FROM match_details WHERE match_id = ${matchId};`;
  const match = await database.get(matchDetails);
  response.send(convertMatchDetailsIntoResponseObject(match));
});
//API 5
app.get("/players/:playerId/matches", async (request, response) => {
  const { playerId } = request.params;
  const getPlayerMatches = `SELECT * FROM player_match_score NATURAL JOIN
                                match_details where player_id =${playerId};`;
  const playerDetail = await database.all(getPlayerMatches);
  response.send(
    playerDetail.map((details) => convertPlayerIntoResponseObject(details))
  );
});
//API 6
app.get("/matches/:matchId/players", async (request, response) => {
  const { matchId } = request.params;
  const matchDetails = `SELECT * FROM player_match_details NATURAL JOIN player_details
                WHERE  match_id = ${matchId};`;
  const match = database.get(matchDetails);
  response.send(
    match.map((player) => convertMatchDetailsIntoResponseObject(player))
  );
});

//A[I 7

app.get("/players/:playerId/playerScores", async (request, response) => {
  const { playerId } = request.params;
  const statistics = `SELECT player_id AS playerID,
                            player_name AS playerName,
                            sum(score) AS totalScore,
                            sum(fours) AS totalFours,
                            sum(sixes) AS totalSixes
                         FROM player_match_score NATURAL JOIN player_details
                         WHERE player_id = ${playerId};`;
  const playerDetails = await database.get(statistics);
  response.send(playerDetails);
});
module.exports = app;
