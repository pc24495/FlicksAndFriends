import React from "react";
import classes from "./Footer.module.css";
import FooterNav from "./FooterNav/FooterNav.js";
import { useSelector } from "react-redux";
import { BsFillPersonPlusFill } from "react-icons/bs";
import { FaUserFriends } from "react-icons/fa";
import { AiFillHome } from "react-icons/ai";
import { FiPlus } from "react-icons/fi";
import { MdLocalMovies } from "react-icons/md";

const Footer = (props) => {
  const loggedIn = useSelector((state) => state.loggedIn);

  return (
    <div
      className={classes.Footer}
      style={{
        display: loggedIn ? "flex" : "none",
      }}
    >
      <FooterNav link={"/friend-requests"}>
        <BsFillPersonPlusFill className={classes.Icon}></BsFillPersonPlusFill>
      </FooterNav>
      <FooterNav link={"/friends"}>
        <FaUserFriends className={classes.Icon}></FaUserFriends>
      </FooterNav>
      <FooterNav link={"/"}>
        <AiFillHome className={classes.Icon}></AiFillHome>
      </FooterNav>
      <FooterNav link={"/create-post"}>
        <FiPlus className={classes.Icon}></FiPlus>
      </FooterNav>
      <FooterNav link={"/subscriptions"}>
        <MdLocalMovies className={classes.Icon}></MdLocalMovies>
      </FooterNav>
    </div>
  );
};

export default Footer;
