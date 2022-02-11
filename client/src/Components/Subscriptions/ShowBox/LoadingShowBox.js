import React from "react";
import classes from "./LoadingShowBox.module.css";

export default function LoadingShowBox(props) {
  return (
    <div className={classes.LoadingShowBox} ref={props.ref}>
      <div className={classes.loader}></div>
    </div>
  );
}
