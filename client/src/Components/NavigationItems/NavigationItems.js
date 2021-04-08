import React, { Component } from "react";
import NavigationItem from "./NavigationItem/NavigationItem.js";
import classes from "./NavigationItems.module.css";
import axios from "axios";

class NavigationItems extends Component {
  state = {
    shows: null,
  };

  getShows = () => {
    console.log("Hi");
    axios
      .get("http://localhost:3000/api/GetAllShows")
      .then((res) => console.log(res.data.rows[0].title));
  };

  render() {
    return (
      <ul className={classes.NavigationItems}>
        <NavigationItem link="/" exact>
          Burger Builder
        </NavigationItem>
        <NavigationItem link="/orders">Orders</NavigationItem>
        <button onClick={this.getShows}>Test Button</button>
      </ul>
    );
  }
}

export default NavigationItems;
