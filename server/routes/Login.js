const express = require("express");
const router = express.Router();
const db = require("../database");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const adjectives = require("adjectives");
const nouns = require("nouns").nouns;

router.get("/", (req, res) => {
  if (req.session.user) {
    res.send({ loggedIn: true, user: req.session.user });
  } else {
    res.send({ loggedIn: false });
  }
});

router.post("/google", async (req, res) => {
  const { googleId, email } = req.body;
  const saltRounds = 10;

  //validation
  if (googleId === null || email === null || email.length > 100) {
    console.log("Failure to log in!");
    return res.json({ success: false });
  }
  //Executes if body data is valid
  else {
    //Check if user is logging in for the first time or not
    const isFirstTime = await db
      .query("SELECT * FROM users WHERE email=$1", [email])
      .then((res) => {
        return res.rows.length === 0;
      });

    if (isFirstTime) {
      let emailUsername = email.slice(0, -10);
      let assignedUsername = "";
      if (emailUsername.length > 20) {
        emailUsername = emailUsername.slice(20);
      }
      const isUsernameAvailable = await db
        .query("SELECT * FROM users WHERE username=$1", [emailUsername])
        .then((res) => res.rows.length === 0);
      //This if-else creates a new username and assigns it to the assignedUsername variable
      if (isUsernameAvailable) {
        assignedUsername = emailUsername;
      } else {
        let foundUsername = false;
        while (!foundUsername) {
          const randomString =
            adjectives[Math.floor(Math.random() * adjectives.length)] +
            nouns[Math.floor(Math.random() * nouns.length)];
          if (randomString.length <= 20) {
            const finalUsername =
              randomString + randomString.length === 20
                ? ""
                : Math.floor(
                    Math.random() * 10 * Math.pow(10, 20 - randomString.length)
                  );
            const isNewUsernameAvailable = await db
              .query("SELECT * FROM users WHERE username=$1", [finalUsername])
              .then((res) => res.rows.length === 0);
            if (isNewUsernameAvailable) {
              foundUsername = true;
              assignedUsername = finalUsername;
            }
          }
        }
      }
      //Finished finding new username and assigned it to assignedUsername
      //Now create a new user using the assignedUsername as username and googleId as password and put it in the database
      bcrypt.hash(googleId, saltRounds, (err, hash) => {
        db.query(
          "INSERT INTO users(username, password) values($1,$2) RETURNING *",
          [assignedUsername, hash]
        ).then((res) => console.log(res.rows));
      });
    } else {
      //needs finishing
    }

    return res.json({ success: true });
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
                  return res.json({
                    success: true,
                    auth: true,
                    token: token,
                    result: dbResults[0],
                  });
                } else {
                  newLoginErrors.passwordErrors.push(
                    "Wrong username/password combination!"
                  );
                  return res.json({
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
            return res.json({ errors: newLoginErrors, success: false });
          }
        }
      }
    );
  } else {
    console.log("Login failed");
    return res.json({ success: false, errors: newLoginErrors });
  }
});

module.exports = router;
