import React, { Component } from "react";
import classes from "./Feed.module.css";
import Post from "../Post/Post.js";
import axios from "axios";
import smile from "./smile.png";
import Backdrop from "../../Backdrop/Backdrop.js";
// import TextareaAutosize from "react-textarea-autosize";

export default class Feed extends Component {
  state = {
    imageArray: null,
    showImage: false,
    showBackdrop: false,
    showDropdowns: false,
  };

  showImageClick = () => {
    axios.get("http://localhost:3000/api/getShowPosters").then((res) => {
      console.log(res.data.image);
      this.setState({ showImage: true, imageArray: res.data.image });
    });
  };

  inputClickHandler = (event) => {
    console.log(this.props);
    this.setState({ showBackdrop: true });
    // this.props.history.push("/submitpost");
  };

  handleBackdropClick = (event) => {
    if (event.target.className.includes("Backdrop_Backdrop")) {
      this.setState({ showBackdrop: false });
    }
  };

  onAnnouncementSelect = (event) => {
    this.setState({ showDropdowns: false });
  };

  onSpoilerSelect = (event) => {
    this.setState({ showDropdowns: true });
  };

  tags = ["ShadowAndBone", "TestingTag", "TestingTag2"];

  render() {
    return (
      <div className={classes.Feed}>
        {this.state.showBackdrop ? (
          <Backdrop
            showBackdrop={this.state.showBackdrop}
            onClick={(event) => this.handleBackdropClick(event)}
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
                    onChange={this.onAnnouncementSelect}
                  ></input>
                  <label for="one">Announcement</label>
                </div>
                <div style={{ display: "inline-block" }}>
                  <input
                    name="Spoilers"
                    type="radio"
                    id="two"
                    onChange={this.onSpoilerSelect}
                  ></input>
                  <label for="two">Spoilers</label>
                </div>
              </div>
              {this.state.showDropdowns ? (
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
            onClick={(event) => this.inputClickHandler(event)}
          ></input>
        </div>
        <Post tags={this.tags}></Post>
        <Post tags={this.tags}></Post>
        <Post tags={this.tags}></Post>
      </div>
    );
  }
}
