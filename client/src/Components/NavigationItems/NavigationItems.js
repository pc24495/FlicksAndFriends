import React, { Component } from "react";
import classes from "./NavigationItems.module.css";
import { connect } from "react-redux";

class NavigationItems extends Component {
  state = {
    shows: null,
  };

  // getShows = () => {
  //   console.log("Hi");
  //   axios
  //     .get("/api/GetAllShows")
  //     .then((res) => console.log(res.data.rows[0].title));
  // };

  render() {
    return <ul className={classes.NavigationItems}>{this.props.children}</ul>;
  }
}

// const mapStateToProps = () => {
//   return {};
// };

export default connect()(NavigationItems);
