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
    console.log(this.props.profilePic);
    return (
      <div className={classes.Sidebar}>
        {this.props.profilePic && (
          <img src={this.props.profilePic} className={classes.ProfilePic}></img>
        )}
        <p className={classes.Username} style={{ fontSize: fontSize }}>
          {this.props.username}
        </p>
        <div
          className={classes.ShowTagContainer}
          style={{
            display:
              this.props.subscriptions && this.props.subscriptions.length > 0
                ? "block"
                : "none",
          }}
        >
          <div className={classes.ShowTagContainerInner}>
            {this.props.subscriptions && this.props.subscriptions.length > 0
              ? this.props.subscriptions.map((show) => (
                  <p className={classes.ShowTag}>#{show.show_title}</p>
                ))
              : null}
          </div>
        </div>

        {this.props.loggedIn ? (
          <NavLink to="/subscriptions" className={classes.Subscriptions}>
            Manage Subscriptions
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
    subscriptions: state.subscriptions,
    profilePic: state.profilePic,
  };
};

export default connect(mapStateToProps)(Sidebar);
