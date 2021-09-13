const express = require("express");
const router = express.Router();
const verifyJWT = require("../middlewares/VerifyJWT.js");
const db = require("../database");

router.get("/subscriptions", verifyJWT, (req, res) => {
  db.query(
    "SELECT subscriptions FROM users WHERE user_id=$1",
    [req.userID],
    (err, result) => {
      if (err) {
        console.log("Error fetching subscriptions");
      } else {
        if (!(result.rows.length > 0)) {
          res.json({ auth: false, subscriptions: [] });
        } else if (result.rows[0].subscriptions === null) {
          res.json({ auth: true, subscriptions: [] });
        } else {
          res.json({
            auth: true,
            subscriptions: result.rows[0].subscriptions,
          });
        }
      }
    }
  );
});

router.get("/subscriptions-and-shows", verifyJWT, async (req, res) => {
  const limit = req.query.limit || null;
  const user_id = req.userID;
  const subscriptions = await db
    .query("SELECT * FROM users WHERE user_id=$1", [user_id])
    .then((result) => result.rows[0].subscriptions || []);
  const subscribedShowIDs = subscriptions.map(
    (subscription) => subscription.show_id
  );
  const subscribedShows = await db
    .query("SELECT * FROM shows WHERE tv_id=ANY($1)", [subscribedShowIDs])
    .then((result) => result.rows);
  const shows = await db
    .query(
      "SELECT * FROM shows WHERE NOT tv_id=ANY($1) ORDER BY popularity DESC LIMIT $2",
      [subscribedShowIDs, limit]
    )
    .then((result) => result.rows);
  res.json({
    shows: [...shows, ...subscribedShows],
    displayShows: shows,
    subscriptions,
  });
});

module.exports = router;
