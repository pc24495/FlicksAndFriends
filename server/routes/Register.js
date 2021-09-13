const express = require("express");
const router = express.Router();
const db = require("../database");
const bcrypt = require("bcrypt");
const saltRounds = 10;

router.post("/", async (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  const newRegisterErrors = {
    usernameErrors: [],
    passwordErrors: [],
    confirmPasswordErrors: [],
  };

  if (password === null || password === "") {
    newRegisterErrors.passwordErrors.push("Please enter a password");
  } else if (
    !(password.length >= 10) ||
    !/[~`!#$%\^&*+=\-\[\]\\';,/{}|\\":<>\?]/g.test(password) ||
    !/\d/.test(password)
  ) {
    newRegisterErrors.passwordErrors.push(
      "Passwords must be at least 10 characters long and contain at least one number and one special character"
    );
  }

  if (username === null || username === "") {
    newRegisterErrors.usernameErrors.push("Please enter a username");
  } else if (username.length > 20) {
    newRegisterErrors.usernameErrors.push(
      "Usernames must be less than 20 characters long"
    );
  }

  if (
    newRegisterErrors.usernameErrors.length != 0 ||
    newRegisterErrors.passwordErrors.length != 0
  ) {
    res.json({ success: false, errors: newRegisterErrors });
  }

  bcrypt.hash(password, saltRounds, (err, hash) => {
    db.query(
      "INSERT INTO users(username, password) values($1,$2)",
      [username, hash],
      (err, result) => {
        if (err) {
          console.log(err);
          newRegisterErrors.usernameErrors.push(
            "Username is already taken, please select a different one"
          );
          res.json({ success: false, errors: newRegisterErrors });
        } else {
          res.json({ success: true });
        }
        //
      }
    );
  });
});

module.exports = router;
