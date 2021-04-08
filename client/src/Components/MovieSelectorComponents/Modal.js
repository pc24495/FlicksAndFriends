import React, { Component } from "react";
import Aux from "../hoc/Aux.js";
import classes from "./Modal.module.css";

export default class Modal extends Component {
  render() {
    return (
      <Aux>
        <div className={classes.Modal}>{this.props.children}</div>
      </Aux>
    );
  }
}
