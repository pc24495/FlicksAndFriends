const express = require("express");
const router = express.Router();
const db = require("../database");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

router.get("/", (req, res) => {
  if (req.session.user) {
    res.send({ loggedIn: true, user: req.session.user });
  } else {
    res.send({ loggedIn: false });
  }
});

router.post("/", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  const newLoginErrors = {
    usernameErrors: [],
    passwordErrors: [],
  };

  if (username === null || username === "") {
    newLoginErrors.usernameErrors.push("Please enter a password");
  }
  if (password === null || password === "") {
    newLoginErrors.passwordErrors.push("Please enter a password");
  }

  if (
    newLoginErrors.usernameErrors.length == 0 &&
    newLoginErrors.passwordErrors.length == 0
  ) {
    db.query(
      "SELECT * FROM users WHERE username=$1",
      [username],
      (err, result) => {
        if (err) {
          console.log("Error fetching from database!");
          res.send({ err: err });
        } else {
          let dbResults = result.rows;
          if (dbResults.length > 0) {
            bcrypt.compare(
              password,
              dbResults[0].password,
              (error, response) => {
                if (response) {
                  req.session.user = dbResults[0];

                  const id = dbResults[0].user_id;
                  const token = jwt.sign({ id }, process.env.SECRET, {
                    expiresIn: "10800s",
                  });
                  res.json({
                    success: true,
                    auth: true,
                    token: token,
                    result: dbResults[0],
                  });
                } else {
                  newLoginErrors.passwordErrors.push(
                    "Wrong username/password combination!"
                  );
                  res.json({
                    auth: false,
                    success: false,
                    message: "Wrong username/password combination!",
                    errors: newLoginErrors,
                  });
                }
              }
            );
          } else {
            newLoginErrors.usernameErrors.push("User doesn't exist");
            res.json({ errors: newLoginErrors, success: false });
          }
        }
      }
    );
  } else {
    res.json({ success: false, errors: newLoginErrors });
  }
});

module.exports = router;
