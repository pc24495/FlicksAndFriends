import React, { useState, useEffect } from "react";
import classes from "./FriendBox.module.css";
import { useSelector } from "react-redux";
import axios from "../../../../axiosConfig";

const FriendBox = (props) => {
  const [state, setState] = useState({
    profilePic: null,
    username: null,
    hover: false,
  });

  useEffect(() => {
    // console.log(props.profilePic);
    setState({
      ...state,
      profilePic: props.profilePic,
      username: props.username,
      hover: false,
    });
  }, []);

  const handleHover = (event) => {
    setState({ ...state, hover: true });
  };

  const closeHover = (event) => {
    const element = document.getElementById(`FriendBox-${props.user_id}`);
    if (element) {
      if (!element.contains(event.target)) {
        document.removeEventListener("mouseover", closeHover);
        setState({ ...state, hover: false });
      }
    }
  };

  useEffect(() => {
    if (state.hover) {
      document.addEventListener("mouseover", closeHover);
    }
    return () => {};
  }, [state.hover]);

  return (
    <div
      className={classes.FriendBox}
      onMouseEnter={handleHover}
      id={`FriendBox-${props.user_id}`}
    >
      <div className={classes.ProfilePicContainer}>
        <img src={state.profilePic} className={classes.ProfilePic}></img>
      </div>
      <div className={classes.FriendBoxBody}>
        <p className={classes.Username}>{state.username}</p>
        <div
          className={classes.RemoveFriend}
          style={{ display: state.hover ? "block" : "none" }}
          onClick={(event) => props.remove_friend(event, props.user_id)}
        >
          REMOVE FRIEND
        </div>
      </div>
    </div>
  );
};

//Looks good but no hovering features besides color change (also means no remove friend opion)
// <div className={classes.FriendBox}>
// <div className={classes.ProfilePicContainer}>
//   <img src={state.profilePic} className={classes.ProfilePic}></img>
// </div>
// <div className={classes.FriendBoxBody}>
//   <p className={classes.Username}>{state.username}</p>
// </div>
// </div>

export default FriendBox;
