import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import classes from "./ShowBox.module.css";

export default function ShowBox(props) {
  //   console.log(props.maxHeight);
  //
  const [currentSeason, setCurrentSeason] = useState(props.show.episodes[0]);
  const [currentEpisode, setCurrentEpisode] = useState(
    currentSeason.episodes[0]
  );
  const [subscription, setSubscription] = useState({
    show_title: props.show.title,
    show_id: props.show.tv_id,
    current_season_name: currentSeason.season_name,
    current_season_id: currentSeason.season_id,
    current_episode_name: currentEpisode.title,
    current_episode_id: currentEpisode.episode_id,
    current_episode_air_date: currentEpisode.air_date,
    current_episode_order: currentEpisode.episodeOrder,
  });

  useEffect(() => {
    setCurrentEpisode(currentSeason.episodes[0]);
  }, [currentSeason]);

  useEffect(() => {
    setSubscription({
      show_title: props.show.title,
      show_id: props.show.tv_id,
      current_season_name: currentSeason.season_name,
      current_season_id: currentSeason.season_id,
      current_episode_name: currentEpisode.title,
      current_episode_id: currentEpisode.episode_id,
      current_episode_air_date: currentEpisode.air_date,
      current_episode_number: currentEpisode.episode_number,
      current_episode_order: currentEpisode.episodeOrder,
    });
  }, [currentEpisode]);

  const changeSeason = (event) => {
    const season_name = event.target.value;
    props.show.episodes.forEach((season) => {
      if (season.season_name === season_name) {
        // console.log(season);
        setCurrentSeason(season);
      }
    });
  };

  const changeEpisode = (event) => {
    const episode_name = event.target.value;
    currentSeason.episodes.forEach((episode) => {
      if (episode.title === episode_name) {
        // console.log(episode);
        setCurrentEpisode(episode);
      }
    });
  };

  return props.poster ? (
    <div
      className={classes.ShowBox}
      id={props.id}
      style={{ height: `${props.maxHeight}px` }}
      data-subscription={JSON.stringify(subscription)}
    >
      <img
        src={"data:image/jpeg;base64," + props.poster}
        className={classes.Poster}
        alt="Image not found"
        height="192px"
        width="342px"
      ></img>
      <div className={classes.Menu}>
        <h2 style={{ maxWidth: "80%", margin: "3px" }}> {props.show.title}</h2>
        <select
          type="select"
          style={{ position: "relative", minWidth: "80%", textAlign: "center" }}
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
            top: "10px",
            position: "relative",
            width: "80%",
            wordWrap: "break-word",
            textOverflow: "ellipsis",
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
