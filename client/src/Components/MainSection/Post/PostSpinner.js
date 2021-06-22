import React from "react";
import classes from "./PostSpinner.module.css";

export default function PostSpinner(props) {
  return (
    <div className={classes.PostSpinner}>
      <div className={classes.loader}></div>
    </div>
  );
}
