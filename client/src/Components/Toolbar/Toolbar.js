import React from "react";
import classes from "./Toolbar.module.css";
import NavigationItems from "../NavigationItems/NavigationItems.js";
import NavigationItem from "../NavigationItems/NavigationItem/NavigationItem.js";
import { useSelector, useDispatch } from "react-redux";
// import axios from "axios";

const Toolbar = (props) => {
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
  const loggedIn = useSelector((state) => state.loggedIn);
  const windowWidth = useSelector((state) => state.windowWidth);
  // const counter = useSelector((state) => state.counter);

  const dispatch = useDispatch();

  // console.log(loggedIn); //

  const logout = () => {
    console.log("LOGGING OUT");
    localStorage.removeItem("token");
    dispatch({ type: "LOGOUT" });
  };

  return (
    <header className={classes.Toolbar}>
      <nav className={classes.DesktopOnly}>
        <NavigationItems>
          <NavigationItem link="/" exact>
            Home
          </NavigationItem>
          {loggedIn ? (
            <div className={classes.Logout} onClick={logout}>
              <p>Logout</p>
            </div>
          ) : null}

          {loggedIn ? null : (
            <NavigationItem link="/registration">Registration</NavigationItem>
          )}
          {loggedIn ? null : (
            <NavigationItem link="/login">Login</NavigationItem>
          )}
        </NavigationItems>
        <p>{windowWidth}</p>
      </nav>
    </header>
  );
};

export default Toolbar;
