import React, { useState, useRef } from "react";
import { useHistory } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import classes from "./MobileSidebar.module.css";
import { GrClose } from "react-icons/gr";
import axios from "../../axiosConfig.js";

export default function MobileSidebar(props) {
  const history = useHistory();
  const sidebarOn = useSelector((state) => state.sidebarOn);
  const dispatch = useDispatch();
  const [backdropState, setBackdropState] = useState({
    showBackdrop: false,
    errorMessage: false,
  });

  const handleDeleteBackdrop = (event) => {
    setBackdropState({ ...backdropState, showBackdrop: true });
  };

  const hideDeleteBackdrop = (event) => {
    setBackdropState({ ...backdropState, showBackdrop: false });
  };

  const handleDelete = async (event) => {
    event.preventDefault();
    if (
      ["delete", "Delete"].includes(
        event.target.elements.delete_account_input.value
      )
    ) {
      axios.delete("/api/users", {
        headers: {
          "x-access-token": localStorage.getItem("token"),
        },
      });
      await dispatch({ type: "LOGOUT" });
      setBackdropState({ ...backdropState, showBackdrop: false });
    }
  };

  const changeProfilePicture = (event) => {
    dispatch({ type: "CHANGE_PROFILE_PICTURE_LINK", redirectLink: "/" });
    history.push("/profilepic");
  };

  return (
    <div
      className={classes.Sidebar}
      style={{ left: sidebarOn ? "0vw" : "-100vw" }}
    >
      <GrClose
        className={classes.CloseButton}
        style={{ opacity: sidebarOn ? "1" : "0" }}
        onClick={() => dispatch({ type: "CLOSE SIDEBAR" })}
      ></GrClose>
      <p className={classes.Option} onClick={changeProfilePicture}>
        Change Profile Picture
      </p>
      <p className={classes.Option} onClick={handleDeleteBackdrop}>
        Delete Account
      </p>
      <div
        className={classes.Backdrop}
        style={{ display: backdropState.showBackdrop ? "flex" : "none" }}
      >
        <div className={classes.DeleteBox}>
          <div className={classes.DeleteBox_CloseSection}>
            <GrClose
              className={classes.DeleteClose}
              onClick={hideDeleteBackdrop}
            ></GrClose>
          </div>
          <p className={classes.WarningMessage}>
            Warning: this action will permanently delete your account and all
            associated posts and likes. Please enter the word "delete" and press
            submit to continue.{" "}
          </p>
          <form className={classes.DeleteForm} onSubmit={handleDelete}>
            <input
              className={classes.DeleteInput}
              id="delete_account_input"
              autocomplete="off"
            ></input>
            <button className={classes.SubmitButton}>Submit</button>
          </form>
          {backdropState.errorMessage && (
            <p className={classes.ErrorMessage}>
              Error: Wrong spelling of "delete" entered
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
