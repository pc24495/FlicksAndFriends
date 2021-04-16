import React from "react";
import classes from "./Toolbar.module.css";
import NavigationItems from "../NavigationItems/NavigationItems.js";
import NavigationItem from "../NavigationItems/NavigationItem/NavigationItem.js";
import axios from "axios";

const toolbar = (props) => {
  // const getShowsData = async () => {
  //   console.log("Hey");
  //   axios
  //     .get("http://localhost:3000/api/GetAllShows")
  //     .then((res) => console.log(res.data));
  // };

  // const testRegistration = async () => {
  //   console.log("Testing registration: ");
  //   axios
  //     .post("http://localhost:3000/api/register", {
  //       username: "PrajwalUsername",
  //       password: "BLA31!",
  //     })
  //     .then((res) => console.log(res));
  // };

  return (
    <header className={classes.Toolbar}>
      <nav className={classes.DesktopOnly}>
        <NavigationItems>
          <NavigationItem link="/" exact>
            Burger Builder
          </NavigationItem>
          <NavigationItem link="/registration">Registration</NavigationItem>
          <NavigationItem link="/login">Login</NavigationItem>
        </NavigationItems>
      </nav>
    </header>
  );
};
//
export default toolbar;
