require("dotenv").config();
const express = require("express");
const db = require("./database");
const cors = require("cors");
const axios = require("axios");
const bcrypt = require("bcrypt");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const base64_arraybuffer = require("base64-arraybuffer");
const requestMod = require("request");
const canvas = require("canvas");
const postsRoute = require("./routes/Posts.js");
const commentsRoute = require("./routes/Comments.js");
const friendsRoute = require("./routes/Friends.js");
const friendRequestsRoute = require("./routes/FriendRequests.js");
const registerRoute = require("./routes/Register.js");
const loginRoute = require("./routes/Login.js");
const usersRoute = require("./routes/Users.js");
const showsRoute = require("./routes/Shows.js");
const verifyJWT = require("./middlewares/VerifyJWT.js");
const jwt = require("jsonwebtoken");
const app = express();

app.use(express.json({ limit: "50mb" }));
app.use(
  cors({
    origin: ["http://localhost:3000"],
    methods: ["GET", "POST"],
    credentials: true,
  })
);
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true, limit: "50mb" }));
app.use(
  session({
    key: "userID",
    secret: "codingIsFun",
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 1000 * 60 * 5,
    },
  })
);

app.use("/api/users", usersRoute);
app.use("/api/register", registerRoute);
app.use("/api/login", loginRoute);
app.use("/api/friend-requests", friendRequestsRoute);
app.use("/api/friends", friendsRoute);
app.use("/api/posts", postsRoute);
app.use("/api/comments/", commentsRoute);
app.use("/api/shows/", showsRoute);

const PORT = process.env.port || 5000;

app.listen(PORT, () => {
  console.log(`Server is up and listening on port ${PORT}`);
});
