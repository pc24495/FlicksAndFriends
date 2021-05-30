import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import classes from "./Backdrop.module.css";

export const Backdrop = (props) => {
  return (
    <div
      className={classes.Backdrop}
      style={{ display: props.showBackdrop ? "block" : "none" }}
    >
      {props.children}
    </div>
  );
};

export default Backdrop;
