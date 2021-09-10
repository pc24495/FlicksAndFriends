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

const saltRounds = 10;
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

app.get("/api/GetAllShows", async (req, res, next) => {
  const results = await db.query("SELECT * FROM shows");
  res.json(results.rows);
});

app.get("/api/test", (req, res) => {
  res.send("Hey");
});

const toDate = (dateString) => {
  let dateArray = dateString.split("-");
  return new Date(
    parseInt(dateArray[0]),
    parseInt(dateArray[1]) - 1,
    parseInt(dateArray[2])
  );
};

app.get("/api/PopulateDatabases", async (req, res, next) => {
  // const results = await db.query("SELECT * FROM shows");
  // res.json(results);
  const API_KEY = "eec78094013670a1ba1d6365a09d8caf";
  const numPages = 300;
  let showData = [];
  for (let pageNum = 201; pageNum <= numPages; pageNum++) {
    console.log("Page number " + pageNum);
    let counter = 0;
    const popularString = `https://api.themoviedb.org/3/tv/popular?api_key=${API_KEY}&language=en-US&page=${pageNum}`;
    const showJSONS = await axios
      .get(popularString)
      .then((res) => res.data.results);
    // console.log(showJSONS);
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

        //Code to get posters take 2
        const title = show.show_name;
        const posterURL_API = `https://api.themoviedb.org/3/tv/${show.tv_id}?api_key=${API_KEY}&language=en-US`;
        let posterJSON = null;
        try {
          posterJSON = await axios.get(posterURL_API);
        } catch {
          posterJSON = null;
        }

        let image64str = null;
        let imgHeight = 0;
        if (posterJSON && posterJSON.data.backdrop_path) {
          try {
            console.log(posterJSON.data.backdrop_path);
            let posterURL = `http://image.tmdb.org/t/p/w342${posterJSON.data.backdrop_path}`;
            console.log(posterURL);
            const imageResponse = await axios.get(posterURL, {
              responseType: "arraybuffer",
            });
            const buffer = Buffer.from(imageResponse.data, "utf-8");
            image64str = base64_arraybuffer.encode(buffer);
            const img = new canvas.Image();
            img.src = "data:image/jpeg;base64," + image64str;
            let imgHeight = 0;
            img.onload = function () {
              imgHeight = img.height;

              // console.log("imgWidth: ", imgWidth);
              console.log("imgHeight: ", imgHeight);
            };
            img.onload();
          } catch (error) {
            console.log(error);
            console.log(
              "Error getting poster for " +
                show.show_name +
                " tv_id: " +
                show.tv_id
            );
            imgHeight = 192;
            image64str =
              "iVBORw0KGgoAAAANSUhEUgAAAOYAAAD6CAYAAAC1fjtbAAAABGdBTUEAALGPC/xhBQAAACBjSFJNAAB6JgAAgIQAAPoAAACA6AAAdTAAAOpgAAA6mAAAF3CculE8AAAAhGVYSWZNTQAqAAAACAAFARIAAwAAAAEAAQAAARoABQAAAAEAAABKARsABQAAAAEAAABSASgAAwAAAAEAAgAAh2kABAAAAAEAAABaAAAAAAAAAGAAAAABAAAAYAAAAAEAA6ABAAMAAAABAAEAAKACAAQAAAABAAAA5qADAAQAAAABAAAA+gAAAAAzWp3bAAAACXBIWXMAAA7EAAAOxAGVKw4bAAABWWlUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iWE1QIENvcmUgNS40LjAiPgogICA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPgogICAgICA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIgogICAgICAgICAgICB4bWxuczp0aWZmPSJodHRwOi8vbnMuYWRvYmUuY29tL3RpZmYvMS4wLyI+CiAgICAgICAgIDx0aWZmOk9yaWVudGF0aW9uPjE8L3RpZmY6T3JpZW50YXRpb24+CiAgICAgIDwvcmRmOkRlc2NyaXB0aW9uPgogICA8L3JkZjpSREY+CjwveDp4bXBtZXRhPgpMwidZAAAGDUlEQVR4Ae3TsQ0AIAwDwcD+OwMFQ3xxSPTWOV4zc973CBAICexQFlEIEPgChukUCAQFDDNYikgEDNMNEAgKGGawFJEIGKYbIBAUMMxgKSIRMEw3QCAoYJjBUkQiYJhugEBQwDCDpYhEwDDdAIGggGEGSxGJgGG6AQJBAcMMliISAcN0AwSCAoYZLEUkAobpBggEBQwzWIpIBAzTDRAIChhmsBSRCBimGyAQFDDMYCkiETBMN0AgKGCYwVJEImCYboBAUMAwg6WIRMAw3QCBoIBhBksRiYBhugECQQHDDJYiEgHDdAMEggKGGSxFJAKG6QYIBAUMM1iKSAQM0w0QCAoYZrAUkQgYphsgEBQwzGApIhEwTDdAIChgmMFSRCJgmG6AQFDAMIOliETAMN0AgaCAYQZLEYmAYboBAkEBwwyWIhIBw3QDBIIChhksRSQChukGCAQFDDNYikgEDNMNEAgKGGawFJEIGKYbIBAUMMxgKSIRMEw3QCAoYJjBUkQiYJhugEBQwDCDpYhEwDDdAIGggGEGSxGJgGG6AQJBAcMMliISAcN0AwSCAoYZLEUkAobpBggEBQwzWIpIBAzTDRAIChhmsBSRCBimGyAQFDDMYCkiETBMN0AgKGCYwVJEImCYboBAUMAwg6WIRMAw3QCBoIBhBksRiYBhugECQQHDDJYiEgHDdAMEggKGGSxFJAKG6QYIBAUMM1iKSAQM0w0QCAoYZrAUkQgYphsgEBQwzGApIhEwTDdAIChgmMFSRCJgmG6AQFDAMIOliETAMN0AgaCAYQZLEYmAYboBAkEBwwyWIhIBw3QDBIIChhksRSQChukGCAQFDDNYikgEDNMNEAgKGGawFJEIGKYbIBAUMMxgKSIRMEw3QCAoYJjBUkQiYJhugEBQwDCDpYhEwDDdAIGggGEGSxGJgGG6AQJBAcMMliISAcN0AwSCAoYZLEUkAobpBggEBQwzWIpIBAzTDRAIChhmsBSRCBimGyAQFDDMYCkiETBMN0AgKGCYwVJEImCYboBAUMAwg6WIRMAw3QCBoIBhBksRiYBhugECQQHDDJYiEgHDdAMEggKGGSxFJAKG6QYIBAUMM1iKSAQM0w0QCAoYZrAUkQgYphsgEBQwzGApIhEwTDdAIChgmMFSRCJgmG6AQFDAMIOliETAMN0AgaCAYQZLEYmAYboBAkEBwwyWIhIBw3QDBIIChhksRSQChukGCAQFDDNYikgEDNMNEAgKGGawFJEIGKYbIBAUMMxgKSIRMEw3QCAoYJjBUkQiYJhugEBQwDCDpYhEwDDdAIGggGEGSxGJgGG6AQJBAcMMliISAcN0AwSCAoYZLEUkAobpBggEBQwzWIpIBAzTDRAIChhmsBSRCBimGyAQFDDMYCkiETBMN0AgKGCYwVJEImCYboBAUMAwg6WIRMAw3QCBoIBhBksRiYBhugECQQHDDJYiEgHDdAMEggKGGSxFJAKG6QYIBAUMM1iKSAQM0w0QCAoYZrAUkQgYphsgEBQwzGApIhEwTDdAIChgmMFSRCJgmG6AQFDAMIOliETAMN0AgaCAYQZLEYmAYboBAkEBwwyWIhIBw3QDBIIChhksRSQChukGCAQFDDNYikgEDNMNEAgKGGawFJEIGKYbIBAUMMxgKSIRMEw3QCAoYJjBUkQiYJhugEBQwDCDpYhEwDDdAIGggGEGSxGJgGG6AQJBAcMMliISAcN0AwSCAoYZLEUkAobpBggEBQwzWIpIBAzTDRAIChhmsBSRCBimGyAQFDDMYCkiETBMN0AgKGCYwVJEImCYboBAUMAwg6WIRMAw3QCBoIBhBksRiYBhugECQQHDDJYiEgHDdAMEggKGGSxFJAKG6QYIBAUMM1iKSAQM0w0QCAoYZrAUkQgYphsgEBQwzGApIhEwTDdAIChgmMFSRCJgmG6AQFDAMIOliETAMN0AgaCAYQZLEYmAYboBAkEBwwyWIhIBw3QDBIIChhksRSQChukGCAQFDDNYikgEDNMNEAgKGGawFJEIGKYbIBAUMMxgKSIRMEw3QCAoYJjBUkQicAEjtgLzcocb1AAAAABJRU5ErkJggg==";
          }
        } else {
          console.log("Error getting poster for" + show.show_name);
          imgHeight = 192;
          image64str =
            "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";
        }
        //Code to get posters take 2 ends

        const returnShow = {
          tv_id: show.tv_id,
          show_name: show.show_name,
          show_popularity: show.show_popularity,
          seasons: seasonResults,
          poster: image64str,
          posterHeight: imgHeight,
        };
        // console.log(seasonResults);

        //Start of code for putting episodes with order into database
        let currentEpisodeOrder = 0;
        let episodes = [];
        returnShow.seasons.forEach((season) => {
          season.episodes.forEach((episode) => episodes.push(episode));
        });
        episodes.sort((a, b) => {
          let a_date = toDate(a.air_date);
          let b_date = toDate(b.air_date);

          if (a_date < b_date) {
            return -1;
          } else if (a_date > b_date) {
            return 1;
          } else {
            if (a.episode_number < b.episode_number) {
              return -1;
            } else if (a.episode_number > b.episode_number) {
              return 1;
            } else {
              return 0;
            }
          }
        });
        // console.log(episodes);
        if (show.show_name === "Game of Thrones") {
          // console.log(episodes);
        }
        let episodesMap = new Map(
          episodes.map((episode) => {
            currentEpisodeOrder = currentEpisodeOrder + 1;
            return [episode.episode_id, currentEpisodeOrder];
          })
        );
        // console.log(episodesMap);
        let seasonsWithOrder = seasonResults.map((season) => {
          let episodesWithOrder = season.episodes.map((episode) => {
            return {
              ...episode,
              episodeOrder: episodesMap.get(episode.episode_id),
            };
          });
          return {
            ...season,
            episodes: episodesWithOrder,
          };
        });

        const finalShow = {
          ...returnShow,
          seasons: seasonsWithOrder,
        };

        // console.log(finalShow.show_name);
        //End of code for putting episodes with orderinto database
        return finalShow;
        //
      })
    );
    // console.log("Results: ");
    showData = showData.concat(showsDataWithSeasons);
  }

  showData.forEach(async (show) => {
    // console.log(show.seasons);
    await db.query(
      "INSERT INTO shows(tv_id, title, popularity, episodes, poster, poster_height) values($1, $2, $3, $4, $5, $6)",
      [
        show.tv_id,
        show.show_name,
        show.show_popularity,
        JSON.stringify(show.seasons),
        show.poster,
        show.posterHeight,
      ]
    );
  });

  res.json({ finished: "page " + 1 + " finished" });
});

app.post("/api/getShowPosters", async (req, res, next) => {
  const API_KEY = "f8858b47";
  const url = `http://www.omdbapi.com/?apikey=${API_KEY}&t=Game+of+Thrones`;

  const showJSON = await axios.get(url);
  const imageURL = showJSON.data.Poster;
  const imageData = await axios.get(imageURL);
  const image = base64_arraybuffer.decode(imageData.data);

  const response = await axios.get(imageURL, { responseType: "arraybuffer" });
  const buffer = Buffer.from(response.data, "utf-8");
  const image64str = base64_arraybuffer.encode(buffer);

  res.json({ image: image64str });
});

app.post("/api/register", async (req, res) => {
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

const verifyJWT = (req, res, next) => {
  const token =
    req.headers["x-access-token"] || req.body.headers["x-access-token"];
  // console.log(token);

  if (!token) {
    console.log("Hey we need a token");
    res.send("Hey, we need a token");
  } else {
    jwt.verify(token, process.env.SECRET, (err, decoded) => {
      // console.log("verifying....");
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

app.get("/api/isUserAuth", verifyJWT, (req, res) => {
  res.send("Hey, you're authenticated!");
});

app.get("/api/users/subscriptions", verifyJWT, (req, res) => {
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

app.get("/api/users/subscriptions-and-shows", verifyJWT, async (req, res) => {
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
  const shows = await db
    .query(
      "SELECT * FROM shows WHERE NOT tv_id=ANY($1) ORDER BY popularity DESC LIMIT $2",
      [subscribedShowIDs, limit]
    )
    .then((result) => result.rows);
  res.json({
    shows: [...shows, ...subscribedShows],
    displayShows: shows,
    subscriptions,
  });
});

app.get("/api/shows/", async (req, res) => {
  const limit = req.query.limit || null;
  const excludeIDs = Array.isArray(req.query.excludeIDs)
    ? req.query.excludeIDs
    : null;
  const searchTerm = req.query.searchTerm;

  if (searchTerm && limit) {
    await db
      .query(
        "SELECT * FROM shows WHERE position(lower($1) in lower(title))>0 ORDER BY popularity DESC LIMIT $2",
        [searchTerm, limit]
      )
      .then((result) => res.json({ shows: result.rows }));
  } else if (excludeIDs) {
    await db
      .query(
        "SELECT * FROM shows WHERE NOT show_id = ANY($1) ORDER BY popularity DESC LIMIT $2",
        [excludeIDs, limit]
      )
      .then((result) => {
        res.json({ shows: result.rows });
      });
  } else {
    await db
      .query("SELECT * FROM shows ORDER BY popularity DESC LIMIT $1", [limit])
      .then((result) => res.json({ shows: result.rows }));
  }
});

app.get("/api/shows/:id", async (req, res) => {
  db.query("SELECT * FROM shows WHERE tv_id=$1", [
    req.params.id,
  ]).then((result) => res.json({ shows: result.rows[0] }));
});

app.post("/api/getShowsFromSubscriptions", verifyJWT, (req, res) => {
  db.query(
    "SELECT * FROM shows WHERE tv_id = ANY ($1)",
    [req.body.subscriptionIDs],
    (err, result) => {
      if (err) {
        console.log("Error getting shows from subscription IDs");
      } else {
        if (result.rows.length > 0) {
          res.json({
            auth: true,
            shows: result.rows,
          });
        } else {
          res.json({
            auth: true,
          });
        }
      }
    }
  );
});

app.delete("/api/shows/", async (req, res) => {
  const showIDs = await db
    .query("SELECT tv_id FROM shows")
    .then((result) => result.rows);
  await Promise.all(
    showIDs.map(async (showID) => {
      const tv_id = showID.tv_id;
      const show = await db
        .query("SELECT * FROM shows WHERE tv_id=$1", [tv_id])
        .then((result) => {
          return result.rows[0];
        });
      if (show.episodes.length === 0) {
        console.log(show.title);
        await db.query("DELETE FROM shows WHERE tv_id=$1", [tv_id]);
      } else {
        const seasons = show.episodes.filter(
          (season) => !(season.episodes.length === 0)
        );
        await db.query("UPDATE shows SET episodes = $1 WHERE tv_id =  $2", [
          JSON.stringify(seasons),
          show.tv_id,
        ]);
      }
    })
  );
  res.send("Done updating");
});
//Hey

app.post("/api/posts/:id/likes", verifyJWT, async (req, res) => {
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

app.patch("/api/posts/:id", verifyJWT, async (request, response) => {
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

app.delete("/api/posts/:id", verifyJWT, async (request, response) => {
  const id = parseInt(request.params.id);
  await db.query("DELETE FROM posts WHERE (user_id = $1) AND (post_id = $2)", [
    request.userID,
    id,
  ]);
});

app.delete("/api/posts/:id/likes", verifyJWT, async (req, res) => {
  const id = req.params.id;
  await db.query(
    "DELETE FROM post_likes WHERE (user_id = $1) AND (post_id = $2)",
    [req.userID, id]
  );
});

app.post("/api/updateSubscriptions", verifyJWT, (req, res) => {
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

app.post("/api/updateProfilePic", verifyJWT, (req, res) => {
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

app.post("/api/postPost", verifyJWT, async (req, result) => {
  // console.log(req.body.type);
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
      // console.log(tags);
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
      console.log(res.rows[0]);
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
      // console.log(tags);
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

app.post("/api/getPosts", verifyJWT, async (req, res) => {
  const subscribedShowIDs = req.body.subscriptionIDs;
  const subscriptionsMap = new Map();
  const userPicsMap = new Map();
  const subscriptions = await db
    .query("SELECT subscriptions FROM users WHERE user_id = $1", [req.userID])
    .then((response) => {
      if (response.rows.length > 0) {
        return response.rows[0].subscriptions;
      } else {
        res.json({ message: "No subscriptions" });
      }
    });

  subscriptions.forEach((subscription) =>
    subscriptionsMap.set(subscription.show_id, subscription)
  );
  const alreadyLoadedPostIDs = req.body.postIDs;
  let posts = [];

  await Promise.all(
    //Iterating through shows
    subscribedShowIDs.map(async (showID) => {
      const postsAboutShow = await db
        .query(
          "SELECT * FROM posts WHERE ((NOT post_id = ANY($1))) AND (tv_id = $2) AND ( (type = $3) OR ( (type = $4 ) AND ( episode_order <= $5) )) ORDER BY num_likes DESC LIMIT 3",
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
  // console.log(posts);
  posts = await Promise.all(
    posts.map(async (post) => {
      if (!req.body.userIDs.includes(post.user_id)) {
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
            // console.log(post.post_id + " " + row.user_id + " " + req.userID);
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
          ? `S${post.season_number === 0 ? "SP" : post.season_number}E${
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
      // console.log(post.user_id + " " + req.userID);
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
  //
  res.json({ posts: posts, userPics: JSON.stringify([...userPicsMap]) });
});
//
//
app.post("/api/comments/:post_id", verifyJWT, async (req, res) => {
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

app.post("/api/updateSubscriptions", (req, res) => {});

app.get("/api/friend-requests", verifyJWT, async (req, res) => {
  const profile_pics = req.query.profile_pics;
  const usernames = req.query.usernames;
  if (usernames && profile_pics) {
    const friend_requests = await db
      .query(
        "SELECT a.sender_id, b.username, a.read, b.profile_pic FROM (SELECT * FROM friend_requests WHERE receiver_id = $1) a JOIN users b ON a.sender_id = b.user_id",
        [req.userID]
      )
      .then((results) => {
        if (results.rows) {
          res.json({
            friend_requests: results.rows,
            num_unread: results.rows.reduce((acc, curr) => {
              return acc + (!curr.read ? 1 : 0);
            }, 0),
          });
        }
      });
  } else if (usernames) {
    const friend_requests = await db
      .query(
        "SELECT a.sender_id, b.username, a.read FROM (SELECT * FROM friend_requests WHERE receiver_id = $1) a JOIN users b ON a.receiver_id = b.user_id",
        [req.userID]
      )
      .then((results) => {
        if (results.rows) {
          res.json({
            friend_requests: results.rows,
            num_unread: results.rows.reduce((acc, curr) => {
              return acc + (!curr.read ? 1 : 0);
            }, 0),
          });
        }
      });
  }
});

app.post("/api/friend-requests/:receiver_id", verifyJWT, async (req, res) => {
  const receiver_id = req.params.receiver_id;
  if (receiver_id === req.userID) {
    res.json({ success: false });
  }
  const isUserAlreadyFriend = await db
    .query(
      "(SELECT * FROM friends WHERE friend_1_id=$1 AND friend_2_id=$2) UNION (SELECT * FROM friends WHERE friend_1_id=$2 AND friend_2_id=$1)",
      [receiver_id, req.userID]
    )
    .then((res) => res.rows.length !== 0);
  if (isUserAlreadyFriend) {
    res.json({ success: false });
  }

  const isFriendRequestAlreadySent = await db
    .query(
      "(SELECT * FROM friend_requests WHERE sender_id=$1 AND receiver_id=$2) UNION (SELECT * FROM friend_requests WHERE sender_id=$2 AND receiver_id=$1)",
      [receiver_id, req.userID]
    )
    .then((res, err) => {
      return res.rows.length !== 0;
    });
  if (isFriendRequestAlreadySent) {
    res.json({ success: false });
  } else {
    db.query("INSERT INTO friend_requests VALUES($1, $2, $3)", [
      req.userID,
      receiver_id,
      false,
    ]).then((result) => {
      res.json({ success: true });
    });
  }
});

// Fix this route
app.patch("/api/friend-requests", verifyJWT, async (req, res) => {
  const read = req.body.params.read;
  if (read) {
    db.query("UPDATE friend_requests SET read=true WHERE receiver_id=$1", [
      req.userID,
    ]).then((result) => {
      return res.json({ success: true });
    });
  } else {
    return res.json({ success: true });
  }
});

app.delete("/api/friend-requests/:receiver_id", verifyJWT, async (req, res) => {
  const receiver_id = req.params.receiver_id;
  db.query(
    "DELETE FROM friend_requests WHERE sender_id = $1 AND receiver_id = $2",
    [req.userID, receiver_id]
  ).then((result) => {
    res.json({ success: true });
  });
});

app.get("/api/friends", verifyJWT, async (request, response) => {
  const profile_pics = request.query.profile_pics;
  db.query(
    "SELECT friend_list.select_user_id, users.username, users.profile_pic, users.user_id FROM (SELECT (CASE WHEN friend_1_id = $1 THEN friend_2_id WHEN friend_2_id = $1 THEN friend_1_id END) AS select_user_id FROM friends) AS friend_list JOIN users ON friend_list.select_user_id = users.user_id",
    [request.userID]
  ).then((result) => {
    return response.status(200).json({ success: true, friends: result.rows });
  });
});

app.get("/api/friends/:friend_id", verifyJWT, async (request, response) => {
  await db
    .query(
      "SELECT * FROM (SELECT friend_list.select_user_id, users.username, users.profile_pic, users.user_id FROM (SELECT (CASE WHEN friend_1_id = $1 THEN friend_2_id WHEN friend_2_id = $1 THEN friend_1_id END) AS select_user_id FROM friends) AS friend_list JOIN users ON friend_list.select_user_id = users.user_id) AS final_list WHERE user_id = $2",
      [request.userID, request.params.friend_id]
    )
    .then((result) => {
      if (result.rows.length > 0) {
        return response
          .status(200)
          .json({ success: true, friends: result.rows });
      } else {
        return response.status(404).json({ success: false });
      }
    });
});

app.post("/api/friends/:friend_id", verifyJWT, async (req, res) => {
  const friend_id = req.params.friend_id;
  const isUserAlreadyFriend = await db
    .query(
      "(SELECT * FROM friends WHERE friend_1_id=$1 AND friend_2_id=$2) UNION (SELECT * FROM friends WHERE friend_1_id=$2 AND friend_2_id=$1)",
      [friend_id, req.userID]
    )
    .then((result) => result.rows.length !== 0);
  if (isUserAlreadyFriend) {
    return res.status(200).json({ success: false });
  } else {
    const isFriendRequestPending = await db
      .query(
        "SELECT * FROM friend_requests WHERE sender_id=$2 AND receiver_id=$1",
        [friend_id, req.userID]
      )
      .then((res, err) => {
        return res.rows.length !== 0;
      });
    if (isFriendRequestPending) {
      return res.status(200).json({ success: false });
    } else {
      db.query(
        "DELETE FROM friend_requests WHERE sender_id = $1 AND receiver_id = $2",
        [friend_id, req.userID]
      );
      db.query("INSERT INTO friends(friend_1_id, friend_2_id) VALUES($1, $2)", [
        req.userID,
        friend_id,
      ]).then((result) => {
        return res.status(200).json({ success: true });
      });
    }
  }
});

app.delete("/api/friends/:friend_id", verifyJWT, async (req, res) => {
  db.query(
    "DELETE FROM friends WHERE (friend_1_id = $1 AND friend_2_id = $2) OR (friend_1_id = $2 AND friend_2_id = $1)",
    [req.userID, req.params.friend_id]
  ).then((result) => {
    res.json({ success: true });
  });
});

const PORT = process.env.port || 5000;

app.listen(PORT, () => {
  console.log(`Server is up and listening on port ${PORT}`);
});
