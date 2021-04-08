import React from "react";
import classes from "./Toolbar.module.css";
import NavigationItems from "../NavigationItems/NavigationItems.js";
import axios from "axios";

const toolbar = (props) => {
  const getShowsData = async () => {
    console.log("Hey");
    axios
      .get("http://localhost:3000/api/GetAllShows")
      .then((res) => console.log(res.data));
  };

  return (
    <header className={classes.Toolbar}>
      <nav className={classes.DesktopOnly}>
        <NavigationItems></NavigationItems>
        <button onClick={getShowsData}>Testing</button>
      </nav>
    </header>
  );
};
//
export default toolbar;
