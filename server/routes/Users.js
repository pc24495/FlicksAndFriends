const express = require("express");
const router = express.Router();
const verifyJWT = require("../middlewares/VerifyJWT.js");
const db = require("../database");

router.get("/", verifyJWT, (req, res) => {
  db.query(
    "SELECT * FROM users WHERE user_id=$1",
    [req.userID],
    (err, result) => {
      if (!(result.rows.length > 0)) {
        res.json({ auth: false });
      } else if (err) {
        console.log("Error");
      } else {
        // console.log(result.rows);
        res.json({ auth: true, userData: result.rows[0] });
      }
    }
  );
});

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
  // const subscribedShows = await db
  const shows = await db
    .query(
      "SELECT * FROM shows WHERE NOT tv_id=ANY($1) ORDER BY popularity DESC LIMIT $2",
      [subscribedShowIDs, limit]
    )
    .then((result) => result.rows);
  //OLD SUBSCRIPTIONS PAGE SYSTEM
  // res.json({
  //   shows: [...shows, ...subscribedShows],
  //   displayShows: shows,
  //   subscriptions,
  // });
  res.status(200).json({ shows, subscribedShows, subscriptions });
});

router.get(
  "/subscription_explanation",
  verifyJWT,
  async (request, response) => {
    const subscriptionExplanation = await db
      .query("SELECT subscription_explanation FROM users WHERE user_id=$1", [
        request.userID,
      ])
      .then((res) => res.rows[0].subscription_explanation);
    // console.log(subscriptionExplanation);
    return response.json({ subscription_explanation: subscriptionExplanation });
  }
);

router.patch("/subscriptions", verifyJWT, (req, res) => {
  db.query(
    "UPDATE users SET subscriptions = $1 WHERE user_id=$2",
    [req.body.subscriptions, req.userID],
    (err, result) => {
      if (err) {
        console.log("Error setting subscriptions");
      } else {
        res.json({
          auth: true,
          subscriptions: JSON.stringify(result.rows[0]),
        });
      }
    }
  );
});

router.patch("/profilePic", verifyJWT, (req, res) => {
  db.query(
    "UPDATE users SET profile_pic = $1 WHERE user_id = $2",
    [req.body.profile_pic, req.userID],
    (err, result) => {
      if (err) {
        console.log("Error changing profile pic!");
      } else {
        res.json({
          auth: true,
        });
      }
    }
  );
});

router.patch("/username", verifyJWT, async (request, response) => {
  // console.log(request.body.username);
  // console.log(request.userID);
  const result = await db
    .query("UPDATE users SET username=$1 WHERE user_id=$2 RETURNING *", [
      request.body.username,
      request.userID,
    ])
    .then((res) => {
      console.log(res.rows[0]);
      return res.rows[0];
    });
  console.log("Returning changed user: ");
  console.log(result);
  return response.status(200).json({ success: true, result });
});

router.patch(
  "/subscription_explanation",
  verifyJWT,
  async (request, response) => {
    db.query("UPDATE users SET subscription_explanation=$1 WHERE user_id=$2", [
      request.body.subscription_explanation,
      request.userID,
    ]);
  }
);

module.exports = router;
