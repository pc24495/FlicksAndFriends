import React, { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import classes from "./Feed.module.css";
import Post from "../Post/Post.js";
import axios from "axios";
import smile from "./smile.png";
import Backdrop from "../../Backdrop/Backdrop.js";
// import TextareaAutosize from "react-textarea-autosize";

export default function Feed(props) {
  //STATE VARIABLES
  const shows = useSelector((state) => {
    return state.shows;
  });
  const subscriptions = useSelector((state) => {
    return state.subscriptions;
  });

  const subscriptionIDs =
    subscriptions && subscriptions.length > 0
      ? subscriptions.map((sub) => {
          return sub.show_id;
        })
      : null;

  console.log(subscriptionIDs);
  // const shows = axios
  //   .get("http://localhost:3000/api/getShowsFromSubscriptions")
  //   .then((res) => res.data.shows);

  // const

  const [state, setState] = useState({
    imageArray: null,
    showImage: false,
    showBackdrop: false,
    showDropdowns: false,
  });

  const loggedIn = useSelector((state) => state.loggedIn);
  // console.log(subscriptions);
  // console.log(shows[0]);

  const setInitShow = (shows) => {
    if (shows.length > 0) {
      // console.log(shows[0]);
      return shows[0];
    } else {
      // console.log("Bloop");
      return null;
    }
  };

  const [currentShow, setCurrentShow] = useState(setInitShow(shows));
  // console.log(currentShow);

  const setInitSeason = (currentShow) => {
    if (currentShow && currentShow.episodes.length > 0) {
      // console.log(currentShow.episodes[0]);
      return currentShow.episodes[0];
    } else {
      // console.log("No episodes in show or show not loaded!");
      return null;
    }
  };

  const [currentSeason, setCurrentSeason] = useState(
    setInitSeason(currentShow)
  );

  const setInitEpisode = (currentSeason) => {
    if (currentSeason && currentSeason.episodes.length > 0) {
      // console.log("About to set init episode");
      // console.log(currentSeason.episodes[0]);
      return currentSeason.episodes[0];
    } else {
      return null;
    }
  };

  const [currentEpisode, setCurrentEpisode] = useState(
    setInitEpisode(currentSeason)
  );

  const [text, setText] = useState("");

  useEffect(() => {
    setCurrentShow(setInitShow(shows));
  }, [shows]);

  useEffect(() => {
    // console.log("Show has been changed");
    setCurrentSeason(setInitSeason(currentShow));
  }, [currentShow]);

  useEffect(() => {
    // console.log("Season has been changed");
    setCurrentEpisode(setInitEpisode(currentSeason));
  }, [currentSeason]);

  // const showImageClick = () => {
  //   axios.get("http://localhost:3000/api/getShowPosters").then((res) => {
  //     console.log(res.data.image);
  //     this.setState({ showImage: true, imageArray: res.data.image });
  //   });
  // };

  //FUNCTIONS
  const inputClickHandler = (event) => {
    // console.log(props);
    if (!loggedIn) {
      props.history.push("/login");
    } else {
      setState({ ...state, showBackdrop: true });
    }
    // this.props.history.push("/submitpost");
  };

  const handleBackdropClick = (event) => {
    if (event.target.className.includes("Backdrop_Backdrop")) {
      setState({ ...state, showBackdrop: false });
    }
  };
  //
  const onAnnouncementSelect = (event) => {
    setState({ ...state, showDropdowns: false });
  };

  const onSpoilerSelect = (event) => {
    setState({ ...state, showDropdowns: true });
  };

  const onShowSelect = (event) => {
    const showTitle = event.target.value;
    // console.log(showTitle);
    shows.forEach((show) => {
      if (show.title === showTitle) {
        setCurrentShow(show);
      }
    });
  };

  const onSeasonSelect = (event) => {
    const seasonTitle = event.target.value;
    // console.log(currentShow);
    // console.log(seasonTitle);
    currentShow.episodes.forEach((season) => {
      if (season.season_name === seasonTitle) {
        setCurrentSeason(season);
      }
    });
  };

  const onEpisodeSelect = (event) => {
    const episodeTitle = event.target.value;
    currentSeason.episodes.forEach((episode) => {
      if (episode.title === episodeTitle) {
        setCurrentEpisode(episode);
      }
    });
  };

  const onTextAreaChange = (event) => {
    setText(event.target.value);
  };

  const submitPost = (event) => {
    console.log("Text: " + text);
    console.log();
  };

  const tags = ["ShadowAndBone", "TestingTag", "TestingTag2"];

  // console.log(shows);
  // console.log(currentShow);
  // console.log(currentSeason);
  //RETURN
  return (
    <div className={classes.Feed}>
      {state.showBackdrop ? (
        <Backdrop
          showBackdrop={state.showBackdrop}
          onClick={handleBackdropClick}
        >
          <div className={classes.Modal}>
            <div className={classes.ModalTitle}>Enter post</div>
            <textarea
              className={classes.PostInput}
              onChange={onTextAreaChange}
            ></textarea>
            <div className={classes.RadioButtons}>
              <div style={{ display: "inline-block" }}>
                <input
                  name="Spoilers"
                  type="radio"
                  id="one"
                  onChange={onAnnouncementSelect}
                ></input>
                <label for="one">Announcement</label>
              </div>
              <div style={{ display: "inline-block" }}>
                <input
                  name="Spoilers"
                  type="radio"
                  id="two"
                  onChange={onSpoilerSelect}
                ></input>
                <label for="two">Spoilers</label>
              </div>
            </div>

            <div
              className={classes.Dropdowns}
              style={{
                display:
                  state.showDropdowns && shows.length > 0 ? "flex" : "none",
              }}
            >
              <select className={classes.Dropdown} onChange={onShowSelect}>
                {shows.map((show) => {
                  // console.log("Show11");
                  return <option id={show.show_id}>{show.title}</option>;
                })}
              </select>
              <select className={classes.Dropdown} onChange={onSeasonSelect}>
                {currentShow.episodes.map((season) => {
                  return (
                    <option id={season.season_id}>{season.season_name}</option>
                  );
                })}
              </select>
              <select className={classes.Dropdown}>
                {currentSeason.episodes.map((episode) => {
                  return (
                    <option id={episode.episode_id}>{episode.title}</option>
                  );
                })}
              </select>
            </div>

            <div className={classes.SubmitButtonContainer}>
              <button className={classes.SubmitButton} onClick={submitPost}>
                Submit Post
              </button>
            </div>
          </div>
        </Backdrop>
      ) : null}

      <div className={classes.InputPost}>
        <img src={smile} className={classes.ProfilePic}></img>
        <input
          className={classes.InputPostInput}
          placeholder="Submit a post..."
          onClick={inputClickHandler}
        ></input>
      </div>
      <Post tags={tags}></Post>
      <Post tags={tags}></Post>
      <Post tags={tags}></Post>
    </div>
  );
}

// {state.showDropdowns && shows.length > 0 ? (
//   <div className={classes.Dropdowns}>
//     <select className={classes.Dropdown} onChange={onShowSelect}>
//       {shows.map((show) => {
//         // console.log("Show11");
//         return <option id={show.show_id}>{show.title}</option>;
//       })}
//     </select>
//     <select className={classes.Dropdown} onChange={onSeasonSelect}>
//       {currentShow.episodes.map((season) => {
//         return (
//           <option id={season.season_id}>
//             {season.season_name}
//           </option>
//         );
//       })}
//     </select>
//     <select className={classes.Dropdown}>
//       {currentSeason.episodes.map((episode) => {
//         return (
//           <option id={episode.episode_id}>{episode.title}</option>
//         );
//       })}
//     </select>
//   </div>
// ) : null}
