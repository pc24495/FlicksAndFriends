const express = require("express");
const router = express.Router();
const verifyJWT = require("../middlewares/VerifyJWT.js");
const db = require("../database");

router.post("/:id/likes", verifyJWT, async (req, res) => {
  const type = req.body.params.type;
  const id = req.params.id;
  await db.query(
    "DELETE FROM post_likes WHERE (user_id = $1) AND (post_id = $2)",
    [req.userID, id]
  );
  await db.query(
    "INSERT INTO post_likes(user_id, post_id, is_like) values($1, $2, $3)",
    [req.userID, id, type === "like"]
  );
});

router.patch("/:id", verifyJWT, async (request, response) => {
  if (!request.body.post_text) {
    return response.status(400).json({ success: false });
  }
  if (request.params.id) {
    console.log(request.params.id);
    const post = await db
      .query("SELECT * FROM posts WHERE post_id = $1", [request.params.id])
      .then((result) => {
        if (result.rows.length > 0) {
          return result.rows[0];
        } else {
          return response.status(404).json({ success: false });
        }
      });
    console.log(post);
    if (post.user_id === request.userID) {
      await db
        .query("UPDATE posts SET post_text = $1 WHERE post_id = $2", [
          request.body.post_text,
          post.post_id,
        ])
        .then((result) => {
          return response.status(200).json({ success: true });
        });
    } else {
      return response.status(403).json({ success: false });
    }
  } else {
    return response.status(400).json({ success: false });
  }
});

router.delete("/:id", verifyJWT, async (request, response) => {
  const id = parseInt(request.params.id);
  await db.query("DELETE FROM posts WHERE (user_id = $1) AND (post_id = $2)", [
    request.userID,
    id,
  ]);
});

router.delete("/:id/likes", verifyJWT, async (req, res) => {
  const id = req.params.id;
  await db.query(
    "DELETE FROM post_likes WHERE (user_id = $1) AND (post_id = $2)",
    [req.userID, id]
  );
});
module.exports = router;
