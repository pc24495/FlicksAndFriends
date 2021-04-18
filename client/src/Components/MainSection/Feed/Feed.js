import React, { Component } from "react";
import classes from "./Feed.module.css";
import Post from "../Post/Post.js";

export default class Feed extends Component {
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
