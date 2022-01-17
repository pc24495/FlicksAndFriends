import React from "react";
import { useSelector } from "react-redux";
import Aux from "../hoc/Aux";
import classes from "./Layout.module.css";
import Backdrop from "../Backdrop/Backdrop.js";
import Toolbar from "../Toolbar/Toolbar.js";
import Footer from "../Footer/Footer.js";

export default function Layout(props) {
  const displayBackdrop = useSelector((state) => state.displayBackdrop);

  return (
    <Aux>
      <Toolbar />
      <main className={classes.content}>{props.children}</main>
      <Footer></Footer>
      <Backdrop
        style={{ display: displayBackdrop ? "flex" : "none" }}
      ></Backdrop>
    </Aux>
  );
}

// Insert below into line 12 to add backdrop
// <Backdrop></Backdrop>
