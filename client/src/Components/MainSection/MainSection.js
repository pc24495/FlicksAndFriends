import React, { Component } from "react";
import classes from "./MainSection.module.css";
import Feed from "./Feed/Feed.js";
import Sidebar from "./Sidebar/Sidebar.js";
// import Modal from "../MovieSelectorComponents/Modal.js";
// import Backdrop from "../MovieSelectorComponents/Backdrop.js";
import { withRouter } from "react-router-dom";

class MainSection extends Component {
  render() {
    return (
      <div className={classes.MainSection}>
        <Sidebar></Sidebar>
        <Feed history={this.props.history}></Feed>
        <div className={classes.TestClass}>
          <div className={classes.TestInner}></div>
        </div>
      </div>
    );
  }
}

export default withRouter(MainSection);

// <Modal></Modal>
