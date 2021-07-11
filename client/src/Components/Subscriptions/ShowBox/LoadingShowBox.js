import React from "react";
import classes from "./LoadingShowBox.module.css";

export default function LoadingShowBox(props) {
  return (
    <div className={classes.LoadingShowBox}>
      <div className={classes.loader}></div>
    </div>
  );
}
