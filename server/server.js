require("dotenv").config();
const express = require("express");
const db = require("./database");
const cors = require("cors");
const axios = require("axios");
const bcrypt = require("bcrypt");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const session = require("express-session");

const saltRounds = 10;
const jwt = require("jsonwebtoken");

const app = express();

app.use(express.json());
app.use(
  cors({
    origin: ["http://localhost:3000"],
    methods: ["GET", "POST"],
    credentials: true,
  })
);
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
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

app.get("/api/GetAllShows", async (req, res, next) => {
  const results = await db.query("SELECT * FROM shows");
  res.json(results);
});

app.get("/api/PopulateDatabases", async (req, res, next) => {
  // const results = await db.query("SELECT * FROM shows");
  // res.json(results);
  const API_KEY = "eec78094013670a1ba1d6365a09d8caf";
  const numPages = 1;
  let showData = [];
  for (let pageNum = 1; pageNum <= numPages; pageNum++) {
    let counter = 0;
    const popularString = `https://api.themoviedb.org/3/tv/popular?api_key=${API_KEY}&language=en-US&page=${pageNum}`;
    const showJSONS = await axios
      .get(popularString)
      .then((res) => res.data.results);
    const showsData = showJSONS.map((el) => {
      const data = {
        tv_id: el.id,
        show_name: el.name,
        show_popularity: Math.round(el.popularity),
      };
      return data;
    });
    // console.log(showsData);
    const showsDataWithSeasons = await Promise.all(
      showsData.map(async (show) => {
        const seasonQueryString = `https://api.themoviedb.org/3/tv/${show.tv_id}?api_key=${API_KEY}&language=en-US`;
        let seasonResults = await axios.get(seasonQueryString).then((res) => {
          // console.log(res.data.seasons);
          return res.data.seasons;
        });

        // console.log(show.tv_id);
        // console.log(seasonResults);
        seasonResults = await Promise.all(
          seasonResults.map(async (season) => {
            let seasonData = null;
            // if (counter === 0) {
            //   // console.log(season);
            //   counter += 1;
            // }

            const episodeQueryString = `https://api.themoviedb.org/3/tv/${show.tv_id}/season/${season.season_number}?api_key=${API_KEY}&language=en-US`;
            let episodeResults = await axios
              .get(episodeQueryString)
              .then((res) => res.data.episodes);
            // console.log(episodeResults);
            // console.log(episodeResults);
            let fixedEpisodes = episodeResults.map((episode) => {
              return {
                episode_id: episode.id,
                air_date: episode.air_date,
                title: episode.name,
                season_number: episode.season_number,
                show_title: show.show_name,
                episode_number: episode.episode_number,
              };
            });
            seasonData = {
              season_id: season.id,
              season_name: season.name,
              season_number: season.season_number,
              episodes: fixedEpisodes,
            };
            // console.log(seasonData);
            return seasonData;
          })
        );

        // console.log(seasonResults);

        const returnShow = {
          tv_id: show.tv_id,
          show_name: show.show_name,
          show_popularity: show.show_popularity,
          seasons: seasonResults,
        };
        // console.log(seasonResults);
        return returnShow;
        //
      })
    );
    // console.log("Results: ");
    showData = showData.concat(showsDataWithSeasons);
  }

  showData.forEach(async (show) => {
    // console.log(show.seasons);
    await db.query(
      "INSERT INTO shows(tv_id, title, popularity, episodes) values($1, $2, $3, $4)",
      [
        show.tv_id,
        show.show_name,
        show.show_popularity,
        JSON.stringify(show.seasons),
      ]
    );
  });

  res.json(showData);
});
//

app.post("/api/register", async (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  bcrypt.hash(password, saltRounds, (err, hash) => {
    db.query(
      "INSERT INTO users(username, password) values($1,$2)",
      [username, hash],
      (err, result) => {
        if (err) {
          console.log(err);
          res.send("User already exists");
        } else {
          res.send("Valid!");
        }
        //
      }
    );
  });
});

const verifyJWT = (req, res, next) => {
  const token = req.headers["x-access-token"];

  if (!token) {
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
//
app.get("/api/getUserData", verifyJWT, (req, res) => {
  db.query(
    "SELECT * FROM users WHERE user_id=$1",
    [req.userID],
    (err, result) => {
      if (err) {
        console.log("Error");
      } else {
        console.log(result.rows);
        res.json({ auth: true, userData: result.rows[0] });
      }
    }
  );
});

app.get("/api/isUserAuth", verifyJWT, (req, res) => {
  res.send("Hey, you're authenticated!");
});

app.get("/api/login", (req, res) => {
  if (req.session.user) {
    res.send({ loggedIn: true, user: req.session.user });
  } else {
    res.send({ loggedIn: false });
  }
});

app.post("/api/login", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

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
          bcrypt.compare(password, dbResults[0].password, (error, response) => {
            if (response) {
              req.session.user = dbResults[0];

              const id = dbResults[0].user_id;
              const token = jwt.sign({ id }, process.env.SECRET, {
                expiresIn: "300s",
              });
              res.json({ auth: true, token: token, result: dbResults[0] });
            } else {
              res.send({
                auth: false,
                message: "Wrong username/password combination!",
              });
            }
          });
        } else {
          res.send({ message: "User doesn't exist!" });
        }
      }
    }
  );
});

const PORT = process.env.port || 5000;

app.listen(PORT, () => {
  console.log(`Server is up and listening on port ${PORT}`);
});
