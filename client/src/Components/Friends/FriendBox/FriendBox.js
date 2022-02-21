import React from "react";
import classes from "./FriendBox.module.css";

const FriendBox = (props) => {
  console.log(props.friend);
  const { profile_pic, username } = props.friend;

  return (
    <div className={classes.FriendBox}>
      <div className={classes.ProfilePicContainer}>
        <img
          src={profile_pic}
          className={classes.ProfilePicture}
          alt="Empty"
        ></img>
      </div>
      <div className={classes.Body}>
        <p className={classes.Username}>{username}</p>
        <div className={classes.Buttons}>
          <button className={classes.Button1} onClick={props.remove}>
            Remove Friend
          </button>
        </div>
      </div>
    </div>
  );
};

export default FriendBox;
