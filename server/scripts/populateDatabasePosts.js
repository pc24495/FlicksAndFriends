require("dotenv").config();
const db = require("../database");

const toDate = (dateString) => {
  let dateArray = dateString.split("-");
  return new Date(
    parseInt(dateArray[0]),
    parseInt(dateArray[1]) - 1,
    parseInt(dateArray[2])
  );
};

const errorHandling = (err, result) => {
  if (err) {
    console.log(episode.air_date);
  }
};

let count = 0;

async function populateDatabases() {
  const show_ids = await db
    .query("SELECT tv_id FROM shows ORDER BY tv_id DESC")
    .then((result) => result.rows.map((show) => show.tv_id));

  const darthVaderID = await db
    .query("SELECT user_ID FROM users WHERE username=$1", ["DarthVader"])
    .then((result) => result.rows[0].user_id);
  const lukeSkywalkerID = await db
    .query("SELECT user_ID FROM users WHERE username=$1", ["LukeSkywalker"])
    .then((result) => result.rows[0].user_id);
  const C3POId = await db
    .query("SELECT user_ID FROM users WHERE username=$1", ["C3PO"])
    .then((result) => result.rows[0].user_id);
  const princessLeiaID = await db
    .query("SELECT user_ID FROM users WHERE username=$1", ["PrincessLeia"])
    .then((result) => result.rows[0].user_id);
  const R2D2ID = await db
    .query("SELECT user_ID FROM users WHERE username=$1", ["R2D2"])
    .then((result) => result.rows[0].user_id);

  await Promise.all(
    show_ids.map(async (tv_id) => {
      console.log(tv_id);
      const show = await db
        .query("SELECT * FROM shows WHERE tv_id=$1", [tv_id])
        .then((result) => result.rows[0]);
      const season = show.episodes[0];
      const episode = season.episodes[0];
      const date = toDate(episode.air_date);
      if (date.toString() === "Invalid Date") {
        count += 1;
        return;
      }
      // console.log(toDate(episode.air_date));
      await db.query(
        "INSERT INTO posts(post_date, user_id, post_text, episode_air_date, episode_order, tv_id, type, episode_number, season_number, show_title) values($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *",
        [
          new Date(),
          darthVaderID,
          "Terrible episode, definitely not watching any more of this show.",
          toDate(episode.air_date),
          episode.episodeOrder,
          show.tv_id,
          "spoiler",
          episode.episode_number,
          season.season_number,
          show.title,
        ],
        (err, result) => {
          if (err) {
            console.log(err);
          }
        }
      );
      await db.query(
        "INSERT INTO posts(post_date, user_id, post_text, episode_air_date, episode_order, tv_id, type, episode_number, season_number, show_title) values($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *",
        [
          new Date(),
          lukeSkywalkerID,
          "Great episode! Highly recommend this show!",
          toDate(episode.air_date),
          episode.episodeOrder,
          show.tv_id,
          "spoiler",
          episode.episode_number,
          season.season_number,
          show.title,
        ],
        (err, result) => {
          if (err) {
            console.log(episode.air_date);
          }
        }
      );
      await db.query(
        "INSERT INTO posts(post_date, user_id, post_text, episode_air_date, episode_order, tv_id, type, episode_number, season_number, show_title) values($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *",
        [
          new Date(),
          princessLeiaID,
          "Looking forward to starting this show!",
          toDate(episode.air_date),
          episode.episodeOrder,
          show.tv_id,
          "announcement",
          episode.episode_number,
          season.season_number,
          show.title,
        ],
        (err, result) => {
          if (err) {
            console.log(episode.air_date);
          }
        }
      );
      await db.query(
        "INSERT INTO posts(post_date, user_id, post_text, episode_air_date, episode_order, tv_id, type, episode_number, season_number, show_title) values($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *",
        [
          new Date(),
          C3POId,
          "Splendid!",
          toDate(episode.air_date),
          episode.episodeOrder,
          show.tv_id,
          "spoiler",
          episode.episode_number,
          season.season_number,
          show.title,
        ],
        (err, result) => {
          if (err) {
            console.log(episode.air_date);
          }
        }
      );
      await db.query(
        "INSERT INTO posts(post_date, user_id, post_text, episode_air_date, episode_order, tv_id, type, episode_number, season_number, show_title) values($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *",
        [
          new Date(),
          R2D2ID,
          "Beep boop beep boop beep boop beep boop beep boop beep boop beep boop beep boop beep boop beep boop beep boop beep boop beep boop beep boop beep boop beep boop beep boop beep boop beep boop beep boop beep boop beep boop beep boop beep boop beep boop beep boop beep boop beep boop beep boop beep boop beep boop beep boop beep boop beep boop beep boop beep boop beep boop beep boop beep boop beep boop beep boop beep boop beep boop beep boop beep boop beep boop beep boop beep boop beep boop beep boop beep boop beep boop beep boop beep boop beep boop beep boop beep boop beep boop beep boop beep boop beep boop beep boop beep boop beep boop beep boop beep boop beep boop beep boop beep boop beep boop beep boop beep boop beep boop beep boop beep boop beep boop beep boop beep boop beep boop beep boop beep boop beep boop beep boop beep boop beep boop beep boop beep boop beep boop beep boop beep boop beep boop beep boop beep boop beep boop beep boop beep boop beep boop beep boop beep boop beep boop beep boop beep boop beep boop beep boop beep boop beep boop beep boop beep boop beep boop beep boop beep boop beep boop",
          toDate(episode.air_date),
          episode.episodeOrder,
          show.tv_id,
          "spoiler",
          episode.episode_number,
          season.season_number,
          show.title,
        ],
        (err, result) => {
          if (err) {
            console.log(episode.air_date);
          }
        }
      );
    })
  );
  console.log(count);
  return;
}

populateDatabases();

// await db.query(
//   "INSERT INTO posts(post_date, user_id, post_text, episode_air_date, episode_order, tv_id, type, episode_number, season_number, show_title) values($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *",
//   [
//     new Date(),
//     lukeSkywalkerID,
//     "Great episode! Highly recommend this show!",
//     toDate(episode.air_date),
//     episode.episodeOrder,
//     show.tv_id,
//     "spoiler",
//     episode.episode_number,
//     season.season_id,
//     show.title,
//   ],
//   (err, result) => {
//     if (err) {
//       console.log(episode.air_date);
//     }
//   }
// );
// await db.query(
//   "INSERT INTO posts(post_date, user_id, post_text, episode_air_date, episode_order, tv_id, type, episode_number, season_number, show_title) values($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *",
//   [
//     new Date(),
//     princessLeiaID,
//     "Looking forward to starting this show!",
//     toDate(episode.air_date),
//     episode.episodeOrder,
//     show.tv_id,
//     "announcement",
//     episode.episode_number,
//     season.season_id,
//     show.title,
//   ],
//   (err, result) => {
//     if (err) {
//       console.log(episode.air_date);
//     }
//   }
// );
// await db.query(
//   "INSERT INTO posts(post_date, user_id, post_text, episode_air_date, episode_order, tv_id, type, episode_number, season_number, show_title) values($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *",
//   [
//     new Date(),
//     C3POId,
//     "Splendid!",
//     toDate(episode.air_date),
//     episode.episodeOrder,
//     show.tv_id,
//     "spoiler",
//     episode.episode_number,
//     season.season_id,
//     show.title,
//   ],
//   (err, result) => {
//     if (err) {
//       console.log(episode.air_date);
//     }
//   }
// );
// await db.query(
//   "INSERT INTO posts(post_date, user_id, post_text, episode_air_date, episode_order, tv_id, type, episode_number, season_number, show_title) values($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *",
//   [
//     new Date(),
//     R2D2ID,
//     "Beep boop beep boop beep boop beep boop beep boop beep boop beep boop beep boop beep boop beep boop beep boop beep boop beep boop beep boop beep boop beep boop beep boop beep boop beep boop beep boop beep boop beep boop beep boop beep boop beep boop beep boop beep boop beep boop beep boop beep boop beep boop beep boop beep boop beep boop beep boop beep boop beep boop beep boop beep boop beep boop beep boop beep boop beep boop beep boop beep boop beep boop beep boop beep boop beep boop beep boop beep boop beep boop beep boop beep boop beep boop beep boop beep boop beep boop beep boop beep boop beep boop beep boop beep boop beep boop beep boop beep boop beep boop beep boop beep boop beep boop beep boop beep boop beep boop beep boop beep boop beep boop beep boop beep boop beep boop beep boop beep boop beep boop beep boop beep boop beep boop beep boop beep boop beep boop beep boop beep boop beep boop beep boop beep boop beep boop beep boop beep boop beep boop beep boop beep boop beep boop beep boop beep boop beep boop beep boop beep boop beep boop beep boop beep boop beep boop beep boop beep boop beep boop",
//     toDate(episode.air_date),
//     episode.episodeOrder,
//     show.tv_id,
//     "spoiler",
//     episode.episode_number,
//     season.season_id,
//     show.title,
//   ],
//   (err, result) => {
//     if (err) {
//       console.log(episode.air_date);
//     }
//   }
// );
