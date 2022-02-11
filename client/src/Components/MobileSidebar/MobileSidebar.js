import React from "react";
import { useSelector, useDispatch } from "react-redux";
import classes from "./MobileSidebar.module.css";
import { GrClose } from "react-icons/gr";

export default function MobileSidebar(props) {
  const sidebarOn = useSelector((state) => state.sidebarOn);
  const dispatch = useDispatch();

  return (
    <div
      className={classes.Sidebar}
      style={{ left: sidebarOn ? "0vw" : "-100vw" }}
    >
      <GrClose
        className={classes.CloseButton}
        onClick={() => dispatch({ type: "CLOSE SIDEBAR" })}
      ></GrClose>
      <p className={classes.Option}>Delete Account</p>
    </div>
  );
}
