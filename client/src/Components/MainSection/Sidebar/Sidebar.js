import React, { Component } from "react";
import classes from "./Sidebar.module.css";
import { connect } from "react-redux";
import { NavLink } from "react-router-dom";

//Requires: username, users subscribed shows

class Sidebar extends Component {
  render() {
    // console.log(this.props);
    let fontSize = "30px";
    if (this.props.username) {
      fontSize = this.props.username.length >= 18 ? "26px" : "30px";
    }
    return (
      <div className={classes.Sidebar}>
        <p className={classes.Username} style={{ fontSize: fontSize }}>
          {this.props.username}
        </p>
        {this.props.shows.map((show) => (
          <p className={classes.ShowTag}>#{show.title}</p>
        ))}
        {this.props.loggedIn ? (
          <NavLink to="/subscriptions" className={classes.Subscriptions}>
            Subscriptions
          </NavLink>
        ) : null}
        <div style={{ height: "100px" }}></div>
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    username: state.username,
    shows: state.shows,
    loggedIn: state.loggedIn,
  };
};

export default connect(mapStateToProps)(Sidebar);
