import React, { Component } from "react";
import classes from "./Backdrop.module.css";
import Modal from "./Modal.js";

export default class Backdrop extends Component {
  render() {
    return (
      <div className={classes.Backdrop}>
        <Modal>
          <div
            style={{
              width: "100%",
              borderBottom: "1px solid gray",
              height: "100px",
            }}
          ></div>
          <div
            style={{
              width: "100%",
              borderBottom: "3px solid red",
              height: "100px",
            }}
          ></div>
        </Modal>
      </div>
    );
  }
}
