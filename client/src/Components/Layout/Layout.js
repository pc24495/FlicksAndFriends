import React from "react";
import { useSelector } from "react-redux";
import Aux from "../hoc/Aux";
import classes from "./Layout.module.css";
import Backdrop from "../Backdrop/Backdrop.js";
import Toolbar from "../Toolbar/Toolbar.js";
import Footer from "../Footer/Footer.js";
import MobileSidebar from "../MobileSidebar/MobileSidebar.js";

export default function Layout(props) {
  const displayBackdrop = useSelector((state) => state.displayBackdrop);

  return (
    <Aux>
      <Toolbar />
      <MobileSidebar></MobileSidebar>
      <main className={classes.content}>{props.children}</main>
      <Footer></Footer>
      <Backdrop
        style={{ display: displayBackdrop ? "flex" : "none" }}
      ></Backdrop>
    </Aux>
  );
}
