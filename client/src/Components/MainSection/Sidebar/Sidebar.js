import React, { Component } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useHistory } from "react-router-dom";
import classes from "./Sidebar.module.css";
import { connect } from "react-redux";
import { NavLink } from "react-router-dom";
import { HiPencilAlt } from "react-icons/hi";

const Sidebar = (props) => {
  const profilePic = useSelector((state) => state.profilePic);
  const username = useSelector((state) => state.username);
  const loggedIn = useSelector((state) => state.loggedIn);
  const subscriptions = useSelector((state) => state.subscriptions);
  const dispatch = useDispatch();
  const history = useHistory();

  const changeProfilePicture = (event) => {
    dispatch({ type: "CHANGE_PROFILE_PICTURE_LINK", redirectLink: "/" });
    history.push("/profilepic");
  };

  return (
    <div className={classes.Sidebar}>
      {profilePic && (
        <img
          src={profilePic}
          className={classes.ProfilePic}
          alt="Profile"
        ></img>
      )}
      {profilePic && (
        <div className={classes.ChangePicLink} onClick={changeProfilePicture}>
          <HiPencilAlt className={classes.EditIcon} />
        </div>
      )}
      <p
        className={classes.Username}
        style={{
          fontSize: username && username.length >= 18 ? "26px" : "30px",
        }}
      >
        {username}
      </p>
      <div
        className={classes.ShowTagContainer}
        style={{
          display: subscriptions && subscriptions.length > 0 ? "block" : "none",
        }}
      >
        <div className={classes.ShowTagContainerInner}>
          {subscriptions && subscriptions.length > 0
            ? subscriptions.map((show) => (
                <p className={classes.ShowTag}>#{show.show_title}</p>
              ))
            : null}
        </div>
      </div>

      {loggedIn ? (
        <NavLink to="/subscriptions" className={classes.Subscriptions}>
          Manage Subscriptions
        </NavLink>
      ) : null}
      <div style={{ height: "100px" }}></div>
    </div>
  );
};

export default Sidebar;
