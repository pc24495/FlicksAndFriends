import React from "react";
import classes from "./Backdrop.module.css";

export const Backdrop = (props) => {
  return (
    <div
      className={classes.Backdrop}
      style={{ display: props.showBackdrop ? "block" : "none" }}
      onClick={props.onClick}
      id={props.id}
    >
      {props.children}
    </div>
  );
};

export default Backdrop;
