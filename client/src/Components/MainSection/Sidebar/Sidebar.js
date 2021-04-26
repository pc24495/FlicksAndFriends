import React, { Component } from "react";
import classes from "./Sidebar.module.css";
import { connect } from "react-redux";

//Requires: username, users subscribed shows

class Sidebar extends Component {
  render() {
    console.log(this.props);
    return (
      <div className={classes.Sidebar}>
        <p className={classes.Username}>{this.props.username}</p>
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    username: state.username,
  };
};

export default connect(mapStateToProps)(Sidebar);
