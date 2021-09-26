const express = require("express");
const router = express.Router();
const verifyJWT = require("../middlewares/VerifyJWT.js");
const db = require("../database");

router.post("/:post_id", verifyJWT, async (req, res) => {
  const post_id = req.params.post_id;
  const text = req.body.text;

  await db
    .query(
      "INSERT INTO comments(comment_body, user_id, post_id, comment_date) VALUES($1, $2, $3,$4) RETURNING *",
      [text, req.userID, post_id, new Date()]
    )
    .then((result) => {
      res.json({ comments: result.rows });
    });
});

module.exports = router;
