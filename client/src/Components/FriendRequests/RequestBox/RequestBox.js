import React from "react";
import classes from "./RequestBox.module.css";

const RequestBox = (props) => {
  const profilePic = props.request.profile_pic;
  const username = props.request.username;
  // eslint-disable-next-line
  return (
    <div className={classes.FriendBox}>
      <div className={classes.ProfilePicContainer}>
        <img
          src={profilePic}
          className={classes.ProfilePicture}
          alt="Empty"
        ></img>
      </div>
      <div className={classes.Body}>
        <p className={classes.Username}>{username}</p>
        <div className={classes.Buttons}>
          <button className={classes.Button1} onClick={props.accept}>
            Accept
          </button>
          <button className={classes.Button2} onClick={props.decline}>
            Decline
          </button>
        </div>
      </div>
    </div>
  );
};

export default RequestBox;
