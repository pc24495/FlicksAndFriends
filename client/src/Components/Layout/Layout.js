import React, { Component } from "react";
import Aux from "../hoc/Aux";
import classes from "./Layout.module.css";
import Toolbar from "../Toolbar/Toolbar.js";
// import Backdrop from "../MovieSelectorComponents/Backdrop.js";

class Layout extends Component {
  render() {
    return (
      <Aux>
        <Toolbar />
        <main className={classes.content}>{this.props.children}</main>
      </Aux>
    );
  }
}

// Insert below into line 12 to add backdrop
// <Backdrop></Backdrop>

export default Layout;
