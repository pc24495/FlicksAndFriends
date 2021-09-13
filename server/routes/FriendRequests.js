const express = require("express");
const router = express.Router();
const verifyJWT = require("../middlewares/VerifyJWT.js");
const db = require("../database");

router.get("/", verifyJWT, async (req, res) => {
  const profile_pics = req.query.profile_pics;
  const usernames = req.query.usernames;
  if (usernames && profile_pics) {
    const friend_requests = await db
      .query(
        "SELECT a.sender_id, b.username, a.read, b.profile_pic FROM (SELECT * FROM friend_requests WHERE receiver_id = $1) a JOIN users b ON a.sender_id = b.user_id",
        [req.userID]
      )
      .then((results) => {
        if (results.rows) {
          res.json({
            friend_requests: results.rows,
            num_unread: results.rows.reduce((acc, curr) => {
              return acc + (!curr.read ? 1 : 0);
            }, 0),
          });
        }
      });
  } else if (usernames) {
    const friend_requests = await db
      .query(
        "SELECT a.sender_id, b.username, a.read FROM (SELECT * FROM friend_requests WHERE receiver_id = $1) a JOIN users b ON a.receiver_id = b.user_id",
        [req.userID]
      )
      .then((results) => {
        if (results.rows) {
          res.json({
            friend_requests: results.rows,
            num_unread: results.rows.reduce((acc, curr) => {
              return acc + (!curr.read ? 1 : 0);
            }, 0),
          });
        }
      });
  }
});

router.post("/:receiver_id", verifyJWT, async (req, res) => {
  const receiver_id = req.params.receiver_id;
  if (receiver_id === req.userID) {
    res.json({ success: false });
  }
  const isUserAlreadyFriend = await db
    .query(
      "(SELECT * FROM friends WHERE friend_1_id=$1 AND friend_2_id=$2) UNION (SELECT * FROM friends WHERE friend_1_id=$2 AND friend_2_id=$1)",
      [receiver_id, req.userID]
    )
    .then((res) => res.rows.length !== 0);
  if (isUserAlreadyFriend) {
    res.json({ success: false });
  }

  const isFriendRequestAlreadySent = await db
    .query(
      "(SELECT * FROM friend_requests WHERE sender_id=$1 AND receiver_id=$2) UNION (SELECT * FROM friend_requests WHERE sender_id=$2 AND receiver_id=$1)",
      [receiver_id, req.userID]
    )
    .then((res, err) => {
      return res.rows.length !== 0;
    });
  if (isFriendRequestAlreadySent) {
    res.json({ success: false });
  } else {
    db.query("INSERT INTO friend_requests VALUES($1, $2, $3)", [
      req.userID,
      receiver_id,
      false,
    ]).then((result) => {
      res.json({ success: true });
    });
  }
});

// Fix this route
router.patch("/", verifyJWT, async (req, res) => {
  const read = req.body.params.read;
  if (read) {
    db.query("UPDATE friend_requests SET read=true WHERE receiver_id=$1", [
      req.userID,
    ]).then((result) => {
      return res.json({ success: true });
    });
  } else {
    return res.json({ success: true });
  }
});

router.delete("/:receiver_id", verifyJWT, async (req, res) => {
  const receiver_id = req.params.receiver_id;
  db.query(
    "DELETE FROM friend_requests WHERE sender_id = $1 AND receiver_id = $2",
    [req.userID, receiver_id]
  ).then((result) => {
    res.json({ success: true });
  });
});

module.exports = router;
