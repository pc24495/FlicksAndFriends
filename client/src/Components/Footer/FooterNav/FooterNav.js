import React from "react";
import classes from "./FooterNav.module.css";
import { NavLink } from "react-router-dom";

const FooterNav = (props) => {
  return (
    <div className={classes.FooterNav}>
      <NavLink exact={true} to={props.link} activeClassName={classes.active}>
        {props.children}
      </NavLink>
    </div>
  );
};

export default FooterNav;
