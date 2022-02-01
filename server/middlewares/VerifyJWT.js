const jwt = require("jsonwebtoken");

const verifyJWT = (req, res, next) => {
  // console.log("Verifying JWT");
  const token =
    req.headers["x-access-token"] || req.body.headers["x-access-token"];
  // console.log(token);

  if (!token) {
    console.log("Hey we need a token");
    res.send("Hey, we need a token");
  } else {
    jwt.verify(token, process.env.SECRET, (err, decoded) => {
      if (err) {
        console.log("Error verifying");
        res.json({ auth: false, message: "You failed to authenticate" });
      } else {
        req.userID = decoded.id;
        next();
      }
    });
  }
};

module.exports = verifyJWT;
