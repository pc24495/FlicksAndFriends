import React, { Component } from "react";
import classes from "./Feed.module.css";
import Post from "../Post/Post.js";
import axios from "axios";

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

  tags = ["ShadowAndBone", "TestingTag", "TestingTag2"];

  render() {
    return (
      <div className={classes.Feed}>
        <Post tags={this.tags}></Post>
        <Post tags={this.tags}></Post>
        <Post tags={this.tags}></Post>
      </div>
    );
  }
}
