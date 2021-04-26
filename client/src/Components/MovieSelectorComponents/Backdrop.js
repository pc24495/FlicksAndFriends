import React, { Component } from "react";
import classes from "./Backdrop.module.css";
import Modal from "./Modal.js";
import { connect } from "react-redux";

class Backdrop extends Component {
  closeBackdropClick = (event) => {
    if (event.target.className.includes("Backdrop")) {
      this.props.closeBackdrop();
    }
  };

  render() {
    return this.props.showBackdrop ? (
      <div className={classes.Backdrop} onClick={this.closeBackdropClick}>
        <Modal>
          <div
            style={{
              width: "100%",
              borderBottom: "1px solid gray",
              height: "100px",
            }}
          ></div>
          <div
            style={{
              width: "100%",
              borderBottom: "3px solid red",
              height: "100px",
            }}
          ></div>
        </Modal>
      </div>
    ) : null;
  }
}

const mapStateToProps = (state) => {
  return {
    showBackdrop: state.showBackdrop,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    closeBackdrop: () => dispatch({ type: "CLOSE_BACKDROP" }),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Backdrop);
