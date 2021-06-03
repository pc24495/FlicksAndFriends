import React, { Component } from "react";
import classes from "./Feed.module.css";
import Post from "../Post/Post.js";
import axios from "axios";
import smile from "./smile.png";

export default class Feed extends Component {
  state = {
    imageArray: null,
    showImage: false,
  };

  showImageClick = () => {
    axios.get("http://localhost:3000/api/getShowPosters").then((res) => {
      console.log(res.data.image);
      this.setState({ showImage: true, imageArray: res.data.image });
    });
  };

  inputClickHandler = (event) => {
    console.log(this.props);
    this.props.history.push("/submitpost");
  };

  tags = ["ShadowAndBone", "TestingTag", "TestingTag2"];

  render() {
    return (
      <div className={classes.Feed}>
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
