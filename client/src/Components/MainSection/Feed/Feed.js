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

  render() {
    return (
      <div className={classes.Feed}>
        <Post></Post>
        <Post></Post>
        <Post></Post>
        <Post></Post>
        <Post></Post>
        <Post></Post>
        <Post></Post>
        <Post></Post>
        <Post></Post>
        <Post></Post>
        <Post></Post>
        <Post></Post>
      </div>
    );
  }
}
