import React, { Component } from "react";
import classes from "./MainSection.module.css";
import Feed from "./Feed/Feed.js";
// import Modal from "../MovieSelectorComponents/Modal.js";
// import Backdrop from "../MovieSelectorComponents/Backdrop.js";
// import Router, { Route } from "react-router-dom";

export default class MainSection extends Component {
  render() {
    return (
      <div className={classes.MainSection}>
        <Feed></Feed>
      </div>
    );
  }
}

// <Modal></Modal>
