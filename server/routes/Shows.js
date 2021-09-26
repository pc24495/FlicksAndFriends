const express = require("express");
const router = express.Router();
const verifyJWT = require("../middlewares/VerifyJWT.js");
const db = require("../database");
const arrayToAllInts = require("../helpers/ArrayToAllInts.js");

router.get("/", async (req, res) => {
  const limit = req.query.limit || null;
  const excludeIDs = Array.isArray(req.query.excludeIDs)
    ? req.query.excludeIDs
    : null;
  const searchTerm = req.query.searchTerm;
  const subscribedShowIDs = req.query.subscriptionIDs
    ? arrayToAllInts(req.query.subscriptionIDs)
    : [];

  if (subscribedShowIDs.length > 0) {
    db.query(
      "SELECT * FROM shows WHERE tv_id = ANY ($1)",
      [subscribedShowIDs],
      (err, result) => {
        if (err) {
          console.log("Error getting shows from subscription IDs");
        } else {
          if (result.rows.length > 0) {
            return res.status(200).json({
              auth: true,
              shows: result.rows,
            });
          } else {
            return res.json({
              auth: true,
            });
          }
        }
      }
    );
  }

  if (searchTerm && limit) {
    await db
      .query(
        "SELECT * FROM shows WHERE position(lower($1) in lower(title))>0 ORDER BY popularity DESC LIMIT $2",
        [searchTerm, limit]
      )
      .then((result) => res.json({ shows: result.rows }));
  } else if (excludeIDs) {
    await db
      .query(
        "SELECT * FROM shows WHERE NOT show_id = ANY($1) ORDER BY popularity DESC LIMIT $2",
        [excludeIDs, limit]
      )
      .then((result) => {
        res.json({ shows: result.rows });
      });
  } else {
    await db
      .query("SELECT * FROM shows ORDER BY popularity DESC LIMIT $1", [limit])
      .then((result) => res.json({ shows: result.rows }));
  }
});

router.get("/:id", async (req, res) => {
  db.query("SELECT * FROM shows WHERE tv_id=$1", [
    req.params.id,
  ]).then((result) => res.json({ shows: result.rows[0] }));
});

module.exports = router;
