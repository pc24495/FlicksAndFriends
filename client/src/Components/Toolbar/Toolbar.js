import React from "react";
import classes from "./Toolbar.module.css";
import NavigationItems from "../NavigationItems/NavigationItems.js";

const toolbar = (props) => {
  return (
    <header className={classes.Toolbar}>
      <nav className={classes.DesktopOnly}>
        <NavigationItems></NavigationItems>
      </nav>
    </header>
  );
};
//
export default toolbar;
