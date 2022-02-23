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
  // console.log(req.body.profile_pic);
  const defaultPic =
    "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/4gIoSUNDX1BST0ZJTEUAAQEAAAIYAAAAAAQwAABtbnRyUkdCIFhZWiAAAAAAAAAAAAAAAABhY3NwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAA9tYAAQAAAADTLQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAlkZXNjAAAA8AAAAHRyWFlaAAABZAAAABRnWFlaAAABeAAAABRiWFlaAAABjAAAABRyVFJDAAABoAAAAChnVFJDAAABoAAAAChiVFJDAAABoAAAACh3dHB0AAAByAAAABRjcHJ0AAAB3AAAADxtbHVjAAAAAAAAAAEAAAAMZW5VUwAAAFgAAAAcAHMAUgBHAEIAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAFhZWiAAAAAAAABvogAAOPUAAAOQWFlaIAAAAAAAAGKZAAC3hQAAGNpYWVogAAAAAAAAJKAAAA+EAAC2z3BhcmEAAAAAAAQAAAACZmYAAPKnAAANWQAAE9AAAApbAAAAAAAAAABYWVogAAAAAAAA9tYAAQAAAADTLW1sdWMAAAAAAAAAAQAAAAxlblVTAAAAIAAAABwARwBvAG8AZwBsAGUAIABJAG4AYwAuACAAMgAwADEANv/bAEMAAwICAgICAwICAgMDAwMEBgQEBAQECAYGBQYJCAoKCQgJCQoMDwwKCw4LCQkNEQ0ODxAQERAKDBITEhATDxAQEP/bAEMBAwMDBAMECAQECBALCQsQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEP/AABEIBQAFAAMBIgACEQEDEQH/xAAdAAEBAAIDAQEBAAAAAAAAAAAABwUGAQMECAIJ/8QAUBABAAEDAQIICwYEBAQCCQUAAAECAwQFBhEHEhUhMUGS0RMiUVNVYXGBkZShFCMyQrHBM1JickOCosIkstLwRWMWFyU0NWRzhOFERnSD4v/EABcBAQEBAQAAAAAAAAAAAAAAAAACAQP/xAAcEQEBAAMBAQEBAAAAAAAAAAAAAQIREjFRIUH/2gAMAwEAAhEDEQA/AP6IALQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA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5E0b0PgfK2+46OagfHo85R2oOPR5yjtQvnImjeh8D5W33HImjeh8D5W33HRzUD49HnKO1Bx6POUdqF85E0b0PgfK2+45E0b0PgfK2+46OagfHo85R2oOPR5yjtQvnImjeh8D5W33HImjeh8D5W33HRzUD49HnKO1Bx6POUdqF85E0b0PgfK2+45E0b0PgfK2+46OagfHo85R2oOPR5yjtQvnImjeh8D5W33HImjeh8D5W33HRzUD49HnKO1Bx6POUdqF85E0b0PgfK2+45E0b0PgfK2+46OagfHo85R2oOPR5yjtQvnImjeh8D5W33HImjeh8D5W33HRzUD49HnKO1Bx6POUdqF85E0b0PgfK2+45E0b0PgfK2+46OagfHo85R2oOPR5yjtQvnImjeh8D5W33HImjeh8D5W33HRzUD49HnKO1Bx6POUdqF85E0b0PgfK2+45E0b0PgfK2+46OagfHo85R2oOPR5yjtQvnImjeh8D5W33HImjeh8D5W33HRzUD49HnKO1Bx6POUdqF85E0b0PgfK2+45E0b0PgfK2+46OagfHo85R2oOPR5yjtQvnImjeh8D5W33HImjeh8D5W33HRzUD49HnKO1Bx6POUdqF85E0b0PgfK2+45E0b0PgfK2+46OagfHo85R2oOPR5yjtQvnImjeh8D5W33HImjeh8D5W33HRzUD49HnKO1Bx6POUdqF85E0b0PgfK2+45E0b0PgfK2+46OagfHo85R2oOPR5yjtQvnImjeh8D5W33HImjeh8D5W33HRzUD49HnKO1Bx6POUdqF85E0b0PgfK2+45E0b0PgfK2+46OagfHo85R2oOPR5yjtQvnImjeh8D5W33HImjeh8D5W33HRzUD49HnKO1Bx6POUdqF85E0b0PgfK2+45E0b0PgfK2+46OagfHo85R2oOPR5yjtQvnImjeh8D5W33HImjeh8D5W33HRzUD49HnKO1Bx6POUdqF85E0b0PgfK2+45E0b0PgfK2+46OagfHo85R2oOPR5yjtQvnImjeh8D5W33HImjeh8D5W33HRzUD49HnKO1Bx6POUdqF85E0b0PgfK2+45E0b0PgfK2+46OagfHo85R2oOPR5yjtQvnImjeh8D5W33HImjeh8D5W33HRzUD49HnKO1Bx6POUdqF85E0b0PgfK2+45E0b0PgfK2+46OagfHo85R2oOPR5yjtQvnImjeh8D5W33HImjeh8D5W33HRzUD49HnKO1Bx6POUdqF85E0b0PgfK2+45E0b0PgfK2+46OagfHo85R2oOPR5yjtQvnImjeh8D5W33HImjeh8D5W33HRzUD49HnKO1Bx6POUdqF85E0b0PgfK2+45E0b0PgfK2+46OagfHo85R2oOPR5yjtQvnImjeh8D5W33HImjeh8D5W33HRzUD49HnKO1Bx6POUdqF85E0b0PgfK2+45E0b0PgfK2+46OagfHo85R2oOPR5yjtQvnImjeh8D5W33HImjeh8D5W33HRzUD49HnKO1Bx6POUdqF85E0b0PgfK2+45E0b0PgfK2+46OagfHo85R2oOPR5yjtQvnImjeh8D5W33HImjeh8D5W33HRzUD49HnKO1Bx6POUdqF85E0b0PgfK2+45E0b0PgfK2+46OagfHo85R2oOPR5yjtQvnImjeh8D5W33HImjeh8D5W33HRzUD49HnKO1Bx6POUdqF85E0b0PgfK2+45E0b0PgfK2+46OagfHo85R2oOPR5yjtQvnImjeh8D5W33HImjeh8D5W33HRzUD49HnKO1Bx6POUdqF85E0b0PgfK2+45E0b0PgfK2+46OagfHo85R2oOPR5yjtQvnImjeh8D5W33HImjeh8D5W33HRzUD49HnKO1Bx6POUdqF85E0b0PgfK2+45E0b0PgfK2+46OagfHo85R2oOPR5yjtQvnImjeh8D5W33HImjeh8D5W33HRzUD49HnKO1Bx6POUdqF85E0b0PgfK2+45E0b0PgfK2+46OagfHo85R2oOPR5yjtQvnImjeh8D5W33HImjeh8D5W33HRzUD49HnKO1Bx6POUdqF85E0b0PgfK2+45E0b0PgfK2+46OagfHo85R2oOPR5yjtQvnImjeh8D5W33HImjeh8D5W33HRzUD49HnKO1Bx6POUdqF85E0b0PgfK2+45E0b0PgfK2+46OagfHo85R2oOPR5yjtQvnImjeh8D5W33HImjeh8D5W33HRzUD49HnKO1Bx6POUdqF85E0b0PgfK2+45E0b0PgfK2+46OagfHo85R2oOPR5yjtQvnImjeh8D5W33HImjeh8D5W33HRzUD49HnKO1Bx6POUdqF85E0b0PgfK2+45E0b0PgfK2+46OagfHo85R2oOPR5yjtQvnImjeh8D5W33HImjeh8D5W33HRzUL07Jox9Rw7/hKPu8i1V+KOquH0FVu407uje8PIujeh8H5a33Pam3apNADGgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP/9k=";
  if (!req.body.profile_pic) {
    req.body.profile_pic = defaultPic;
  }
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
      return res.rows[0];
    });
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

router.delete("/", verifyJWT, (request, response) => {
  console.log(request.userID);
  db.query("DELETE FROM users WHERE user_id=$1", [request.userID]);
});

module.exports = router;
