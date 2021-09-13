const express = require("express");
const router = express.Router();
const verifyJWT = require("../middlewares/VerifyJWT.js");
const db = require("../database");

router.get("/", verifyJWT, async (request, response) => {
  const profile_pics = request.query.profile_pics;
  db.query(
    "SELECT friend_list.select_user_id, users.username, users.profile_pic, users.user_id FROM (SELECT (CASE WHEN friend_1_id = $1 THEN friend_2_id WHEN friend_2_id = $1 THEN friend_1_id END) AS select_user_id FROM friends) AS friend_list JOIN users ON friend_list.select_user_id = users.user_id",
    [request.userID]
  ).then((result) => {
    return response.status(200).json({ success: true, friends: result.rows });
  });
});

router.get("/:friend_id", verifyJWT, async (request, response) => {
  await db
    .query(
      "SELECT * FROM (SELECT friend_list.select_user_id, users.username, users.profile_pic, users.user_id FROM (SELECT (CASE WHEN friend_1_id = $1 THEN friend_2_id WHEN friend_2_id = $1 THEN friend_1_id END) AS select_user_id FROM friends) AS friend_list JOIN users ON friend_list.select_user_id = users.user_id) AS final_list WHERE user_id = $2",
      [request.userID, request.params.friend_id]
    )
    .then((result) => {
      if (result.rows.length > 0) {
        return response
          .status(200)
          .json({ success: true, friends: result.rows });
      } else {
        return response.status(404).json({ success: false });
      }
    });
});

router.post("/:friend_id", verifyJWT, async (req, res) => {
  const friend_id = req.params.friend_id;
  const isUserAlreadyFriend = await db
    .query(
      "(SELECT * FROM friends WHERE friend_1_id=$1 AND friend_2_id=$2) UNION (SELECT * FROM friends WHERE friend_1_id=$2 AND friend_2_id=$1)",
      [friend_id, req.userID]
    )
    .then((result) => result.rows.length !== 0);
  if (isUserAlreadyFriend) {
    return res.status(200).json({ success: false });
  } else {
    const isFriendRequestPending = await db
      .query(
        "SELECT * FROM friend_requests WHERE sender_id=$2 AND receiver_id=$1",
        [friend_id, req.userID]
      )
      .then((res, err) => {
        return res.rows.length !== 0;
      });
    if (isFriendRequestPending) {
      return res.status(200).json({ success: false });
    } else {
      db.query(
        "DELETE FROM friend_requests WHERE sender_id = $1 AND receiver_id = $2",
        [friend_id, req.userID]
      );
      db.query("INSERT INTO friends(friend_1_id, friend_2_id) VALUES($1, $2)", [
        req.userID,
        friend_id,
      ]).then((result) => {
        return res.status(200).json({ success: true });
      });
    }
  }
});

router.delete("/:friend_id", verifyJWT, async (req, res) => {
  db.query(
    "DELETE FROM friends WHERE (friend_1_id = $1 AND friend_2_id = $2) OR (friend_1_id = $2 AND friend_2_id = $1)",
    [req.userID, req.params.friend_id]
  ).then((result) => {
    res.json({ success: true });
  });
});

module.exports = router;
