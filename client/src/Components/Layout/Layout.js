import React, { Component } from "react";
import Aux from "../hoc/Aux";
import classes from "./Layout.module.css";
import Toolbar from "../Toolbar/Toolbar.js";

class Layout extends Component {
  render() {
    return (
      <Aux>
        <Toolbar height="11%" />
        <main className={classes.content}>{this.props.children}</main>
      </Aux>
    );
  }
}

export default Layout;
