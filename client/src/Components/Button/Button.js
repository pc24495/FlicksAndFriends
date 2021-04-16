import React, { Component } from "react";
import classes from "./Button.module.css";

export default class Button extends Component {
  render() {
    return (
      <button
        className={this.props.disabled ? classes.Disabled : classes.Button}
      >
        {this.props.children}
      </button>
    );
  }
}
