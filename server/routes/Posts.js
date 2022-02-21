const express = require("express");
const router = express.Router();
const verifyJWT = require("../middlewares/VerifyJWT.js");
const db = require("../database");
const arrayToAllInts = require("../helpers/ArrayToAllInts.js");

const toDate = (dateString) => {
  let dateArray = dateString.split("-");
  return new Date(
    parseInt(dateArray[0]),
    parseInt(dateArray[1]) - 1,
    parseInt(dateArray[2])
  );
};

router.get("/", verifyJWT, async (req, res) => {
  const subscribedShowIDs = req.query.subscriptionIDs
    ? arrayToAllInts(req.query.subscriptionIDs)
    : [];
  const userIDs = req.query.userIDs ? arrayToAllInts(req.query.userIDs) : [];
  const alreadyLoadedPostIDs = req.query.postIDs
    ? arrayToAllInts(req.query.postIDs)
    : [];
  const subscriptionsMap = new Map();
  const userPicsMap = new Map();
  const subscriptions = await db
    .query("SELECT subscriptions FROM users WHERE user_id = $1", [req.userID])
    .then((response) => {
      if (response.rows.length > 0) {
        return response.rows[0].subscriptions;
      } else {
        return res.json({ message: "No subscriptions" });
      }
    });

  subscriptions.forEach((subscription) =>
    subscriptionsMap.set(subscription.show_id, subscription)
  );
  let posts = [];

  await Promise.all(
    //Iterating through shows
    subscribedShowIDs.map(async (showID) => {
      const postsAboutShow = await db
        .query(
          "SELECT * FROM posts WHERE ((NOT post_id = ANY($1))) AND (tv_id = $2) AND ( (type = $3) OR ( (type = $4 ) AND ( episode_order <= $5) )) ORDER BY num_likes, post_date DESC LIMIT 4",
          [
            alreadyLoadedPostIDs,
            showID,
            "announcement",
            "spoiler",
            subscriptionsMap.get(showID).current_episode_order,
          ]
        )
        .then((res) => {
          return res.rows;
        });
      posts = posts.concat(postsAboutShow);
    })
    //Done iterating through shows
  );

  posts = posts
    .sort((el1, el2) => {
      if (el1.num_likes < el2.num_likes) {
        return -1;
      } else if (el1.num_likes > el2.num_likes) {
        return 1;
      } else {
        return 0;
      }
    })
    .slice(0, 6);
  posts = await Promise.all(
    posts.map(async (post) => {
      if (!userIDs.includes(post.user_id)) {
        const userProfilePic = await db
          .query("SELECT profile_pic FROM users WHERE user_id = $1", [
            post.user_id,
          ])
          .then((res) => res.rows[0].profile_pic);
        userPicsMap.set(post.user_id, userProfilePic);
      }
      let username = await db
        .query("SELECT username FROM users WHERE user_id = $1", [post.user_id])
        .then((res) => res.rows[0].username);
      let postLikes = [];
      let userLikedPost = 0;
      await db
        .query("SELECT * FROM post_likes WHERE post_id = $1", [post.post_id])
        .then((res) => {
          res.rows.forEach(async (row) => {
            if (row.user_id === req.userID) {
              userLikedPost = row.is_like ? 1 : -1;
            }
            if (!userPicsMap.has(req.userID)) {
              await db
                .query(
                  "SELECT profile_pic, username FROM users WHERE user_id = $1",
                  [req.userID]
                )
                .then((res) => {
                  userPicsMap.set(req.userID, res.rows[0].profile_pic);
                });
            }
          });
          postLikes = postLikes.concat(res.rows);
        });

      let comments = await db
        .query("SELECT * FROM comments WHERE post_id=$1", [post.post_id])
        .then(async (result) => {
          if (result.rows && result.rows.length > 0) {
            Promise.all(
              result.rows.map(async (comment) => {
                if (!userPicsMap.has(comment.user_id)) {
                  const profile_pic = await db
                    .query("SELECT * FROM users WHERE user_id = $1", [
                      comment.user_id,
                    ])
                    .then((result) => result.rows[0].profile_pic);
                  userPicsMap.set(comment.user_id, profile_pic);
                }
              })
            );
            return result.rows;
          } else {
            return [];
          }
        });

      const episodeTag =
        post.type === "spoiler"
          ? `S${post.season_number === 0 ? "P" : post.season_number}E${
              post.episode_number
            }`
          : null;
      const tags = [
        { type: "type", text: post.type[0].toUpperCase() + post.type.slice(1) },
        { type: "title", text: post.show_title },
        { type: "episode_tag", text: episodeTag },
      ];

      //Start of code to get friend status message

      const sentRequestStatus = await db
        .query(
          "SELECT * FROM friend_requests WHERE sender_id = $1 AND receiver_id = $2",
          [req.userID, post.user_id]
        )
        .then((res) =>
          res.rows.length !== 0 ? "Unsend Friend Request" : null
        );
      const receivedRequestStatus = await db
        .query(
          "SELECT * FROM friend_requests WHERE sender_id = $1 AND receiver_id = $2",
          [post.user_id, req.userID]
        )
        .then((res) =>
          res.rows.length !== 0 ? "Accept Friend Request" : null
        );
      const friendStatus = await db
        .query(
          "(SELECT * FROM friends WHERE friend_1_id = $1 AND friend_2_id = $2) UNION (SELECT * FROM friends WHERE friend_1_id = $2 AND friend_2_id = $1)",
          [post.user_id, req.userID]
        )
        .then((res) => (res.rows.length !== 0 ? "Unfriend User" : null));
      const userStatus = post.user_id === req.userID ? "Current User" : null;
      //
      let friend_status =
        sentRequestStatus ||
        receivedRequestStatus ||
        friendStatus ||
        userStatus ||
        "Add Friend";

      //End of code to get friend status message
      // let numLikesWithoutCurrentUser = 0;
      const numLikesWithoutCurrentUser = postLikes.reduce((acc, curr) => {
        if (parseInt(curr.user_id) !== parseInt(req.userID)) {
          return acc + (curr.is_like ? 1 : -1);
        } else {
          return acc;
        }
      }, 0);

      return {
        ...post,
        post_id: parseInt(post.post_id),
        user_liked_post: userLikedPost,
        comments: comments,
        likes: postLikes,
        username: username,
        post_date: post.post_date,
        body: post.post_text,
        user_id: post.user_id,
        episode_tag: episodeTag,
        type: post.type,
        show_title: post.show_title,
        tags: tags,
        num_likes: numLikesWithoutCurrentUser,
        friend_status,
      };
    })
  );
  return res.json({ posts: posts, userPics: JSON.stringify([...userPicsMap]) });
});

router.post("/", verifyJWT, async (req, result) => {
  if (req.body.episode_air_date.toString() === "Invalid Date") {
    return res.status(400).json({ error: "Invalid date" });
  }

  const [
    username,
    userProfilepic,
  ] = await db
    .query("SELECT * FROM users WHERE user_id = $1", [req.userID])
    .then((res) => {
      return [res.rows[0].username, res.rows[0].profile_pic];
    });
  if (req.body.type === "spoiler") {
    db.query(
      "INSERT INTO posts(post_date, user_id, post_text, episode_air_date, episode_order, tv_id, type, episode_number, season_number, show_title) values($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *",
      [
        new Date(),
        req.userID,
        req.body.post_text,
        toDate(req.body.episode_air_date),
        req.body.episode_order,
        req.body.tv_id,
        req.body.type,
        req.body.episode_number,
        req.body.season_number,
        req.body.title,
      ]
    ).then((res) => {
      const userLikedPost = 0;
      const comments = [];
      const postLikes = [];
      const episodeTag =
        res.rows[0].type === "spoiler"
          ? `S${
              res.rows[0].season_number === 0 ? "P" : res.rows[0].season_number
            }E${res.rows[0].episode_number}`
          : null;
      const tags = [
        {
          type: "type",
          text: res.rows[0].type[0].toUpperCase() + res.rows[0].type.slice(1),
        },
        { type: "title", text: res.rows[0].show_title },
        { type: "episode_tag", text: episodeTag },
      ];
      result.json({
        posts: [
          {
            ...res.rows[0],
            post_id: parseInt(res.rows[0].post_id),
            user_liked_post: userLikedPost,
            comments: comments,
            likes: postLikes,
            username: username,
            post_date: res.rows[0].post_date,
            body: res.rows[0].post_text,
            user_id: res.rows[0].user_id,
            episode_tag: episodeTag,
            type: res.rows[0].type,
            show_title: res.rows[0].show_title,
            tags: tags,
            friend_status: "Current User",
            num_likes: 0,
          },
        ],
        profile_pic: userProfilepic,
        user_id: req.userID,
      });
    });
  } else {
    db.query(
      "INSERT INTO posts(post_date, user_id, post_text, tv_id, type, show_title) values($1, $2, $3, $4, $5, $6) RETURNING *",
      [
        new Date(),
        req.userID,
        req.body.post_text,
        req.body.tv_id,
        req.body.type,
        req.body.title,
      ]
    ).then((res) => {
      const userLikedPost = 0;
      const comments = [];
      const postLikes = [];
      const episodeTag =
        res.rows[0].type === "spoiler"
          ? `S${
              res.rows[0].season_number === 0 ? "P" : res.rows[0].season_number
            }E${res.rows[0].episode_number}`
          : null;
      const tags = [
        {
          type: "type",
          text: res.rows[0].type[0].toUpperCase() + res.rows[0].type.slice(1),
        },
        { type: "title", text: res.rows[0].show_title },
        { type: "episode_tag", text: episodeTag },
      ];
      result.json({
        posts: [
          {
            ...res.rows[0],
            post_id: parseInt(res.rows[0].post_id),
            user_liked_post: userLikedPost,
            comments: comments,
            likes: postLikes,
            username: username,
            post_date: res.rows[0].post_date,
            body: res.rows[0].post_text,
            user_id: res.rows[0].user_id,
            episode_tag: episodeTag,
            type: res.rows[0].type,
            show_title: res.rows[0].show_title,
            tags: tags,
            friend_status: "Current User",
            num_likes: 0,
          },
        ],
        profile_pic: userProfilepic,
        user_id: req.userID,
      });
    });
  }
});

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
    const post = await db
      .query("SELECT * FROM posts WHERE post_id = $1", [request.params.id])
      .then((result) => {
        if (result.rows.length > 0) {
          return result.rows[0];
        } else {
          return response.status(404).json({ success: false });
        }
      });
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
