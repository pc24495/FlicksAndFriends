import React, { useState } from "react";
import classes from "./Feed.module.css";
import Post from "../Post/Post.js";
import axios from "axios";
import smile from "./smile.png";
import Backdrop from "../../Backdrop/Backdrop.js";
// import TextareaAutosize from "react-textarea-autosize";

export default function Feed(props) {
  const [state, setState] = useState({
    imageArray: null,
    showImage: false,
    showBackdrop: false,
    showDropdowns: false,
  });

  // const showImageClick = () => {
  //   axios.get("http://localhost:3000/api/getShowPosters").then((res) => {
  //     console.log(res.data.image);
  //     this.setState({ showImage: true, imageArray: res.data.image });
  //   });
  // };

  const inputClickHandler = (event) => {
    console.log(props);
    setState({ ...state, showBackdrop: true });
    // this.props.history.push("/submitpost");
  };

  const handleBackdropClick = (event) => {
    if (event.target.className.includes("Backdrop_Backdrop")) {
      setState({ ...state, showBackdrop: false });
    }
  };

  const onAnnouncementSelect = (event) => {
    setState({ ...state, showDropdowns: false });
  };

  const onSpoilerSelect = (event) => {
    setState({ ...state, showDropdowns: true });
  };

  const tags = ["ShadowAndBone", "TestingTag", "TestingTag2"];

  return (
    <div className={classes.Feed}>
      {state.showBackdrop ? (
        <Backdrop
          showBackdrop={state.showBackdrop}
          onClick={handleBackdropClick}
        >
          <div className={classes.Modal}>
            <div className={classes.ModalTitle}>Enter post</div>
            <textarea className={classes.PostInput}></textarea>
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
            {state.showDropdowns ? (
              <div className={classes.Dropdowns}>
                <select className={classes.Dropdown}></select>
                <select className={classes.Dropdown}></select>
                <select className={classes.Dropdown}></select>
              </div>
            ) : null}
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
