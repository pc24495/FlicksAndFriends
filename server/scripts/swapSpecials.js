require("dotenv").config();
const db = require("../database");

let counter = 0;

const fixShow = async (showID) => {
  const { tv_id } = showID;
  const seasons = await db
    .query("SELECT * FROM shows WHERE tv_id=$1", [tv_id])
    .then((res) => res.rows[0].episodes);
  //   console.log(seasons[0].season_name.toLowerCase());
  if (seasons.length > 1) {
    if (
      seasons[0].season_name.toLowerCase().includes("specials") &&
      seasons[1].season_name.toLowerCase().includes("season")
    ) {
      //   console.log(seasons);
      const specialsSeason = seasons.splice(0, 1);
      const newSeasons = JSON.stringify(seasons.concat(specialsSeason));
      console.log(newSeasons);
      db.query("UPDATE shows SET episodes=$1 WHERE tv_id=$2", [
        newSeasons,
        tv_id,
      ]);

      //   console.log("NEW SEASONS: ");
      //   console.log(newSeasons);
      counter += 1;
      console.log(counter);
    }
  }
};

async function swapSpecials() {
  const showIDs = await db
    .query("SELECT tv_id FROM shows")
    .then((res) => res.rows);
  showIDs.forEach(fixShow);
}

swapSpecials();
