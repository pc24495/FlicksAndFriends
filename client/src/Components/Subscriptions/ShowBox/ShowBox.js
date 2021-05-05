import React, { useState } from "react";
import { useSelector } from "react-redux";
import classes from "./ShowBox.module.css";

export default function ShowBox(props) {
  //   console.log(props.maxHeight);

  const [currentSeason, setCurrentSeason] = useState(props.show.episodes[0]);
  const [currentEpisode, setCurrentEpisode] = useState(
    currentSeason.episodes[0]
  );

  const changeSeason = (event) => {
    const season_name = event.target.value;
    props.show.episodes.forEach((season) => {
      if (season.season_name === season_name) {
        console.log(season);
        setCurrentSeason(season);
      }
    });
  };

  const changeEpisode = (event) => {
    const episode_name = event.target.value;
    currentSeason.episodes.forEach((episode) => {
      if (episode.title === episode_name) {
        console.log(episode);
        setCurrentEpisode(episode);
      }
    });
  };

  return props.poster ? (
    <div
      className={classes.ShowBox}
      id={props.id}
      style={{ height: `${props.maxHeight}px` }}
    >
      <img
        src={"data:image/jpeg;base64," + props.poster}
        className={classes.Poster}
        alt="Image not found"
      ></img>
      <div className={classes.Menu}>
        <h2 style={{ maxWidth: "80%" }}> {props.show.title}</h2>
        <select
          type="select"
          style={{ position: "relative", maxWidth: "80%" }}
          onChange={(event) => changeSeason(event)}
        >
          {props.show.episodes.map((season) => (
            <option
              key={season.season_id}
              value={season.season_name}
              style={{ position: "relative", maxWidth: "80%" }}
            >
              {season.season_name}
            </option>
          ))}
        </select>
        <select
          type="select"
          style={{
            position: "relative",
            maxWidth: "80%",
            wordWrap: "break-word",
          }}
          onChange={(event) => changeEpisode(event)}
        >
          {currentSeason.episodes.map((episode) => (
            <option key={episode.episode_id} value={episode.title}>
              {episode.title}
            </option>
          ))}
        </select>
        <button
          style={{ position: "relative", top: "20px" }}
          onClick={props.submitFunc}
        >
          Submit
        </button>
      </div>
    </div>
  ) : null;
}
