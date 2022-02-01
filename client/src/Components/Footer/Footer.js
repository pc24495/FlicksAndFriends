import React, { useState, useEffect } from "react";
import classes from "./Footer.module.css";
import FooterNav from "./FooterNav/FooterNav.js";
import axios from "../../axiosConfig.js";
import { useSelector } from "react-redux";
import { BsFillPersonPlusFill } from "react-icons/bs";
import { FaUserFriends } from "react-icons/fa";
import { AiFillHome } from "react-icons/ai";
import { FiPlus } from "react-icons/fi";
import { MdLocalMovies } from "react-icons/md";

const Footer = (props) => {
  const loggedIn = useSelector((state) => state.loggedIn);
  const newFriendStatus = useSelector((state) => state.newFriendStatus);
  const [friendRequests, setFriendRequests] = useState({
    requests: [],
    numUnread: 0,
  });

  useEffect(() => {
    const token = localStorage.getItem("token");
    axios
      .get("/api/friend-requests", {
        headers: {
          "x-access-token": token,
        },
        params: {
          profile_pics: true,
          usernames: true,
        },
      })
      .then((res) => {
        if (res.data.friend_requests) {
          console.log(res.data.friend_requests);
          setFriendRequests({
            ...friendRequests,
            requests: res.data.friend_requests,
            numUnread: res.data.num_unread,
          });
        }
      });
    return () => {};
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    if (Object.keys(newFriendStatus).length !== 0) {
      const isInNotifications = friendRequests.requests.find(
        (friend) =>
          parseInt(friend.sender_id) === parseInt(newFriendStatus.userID)
      );
      let changeUnread = 0;
      if (!(isInNotifications === undefined)) {
        changeUnread = -1;
      }
      const newRequests = friendRequests.requests.filter(
        (req) => parseInt(req.sender_id) !== parseInt(newFriendStatus.userID)
      );
      switch (newFriendStatus.update) {
        case "Accept Friend Request":
          setFriendRequests((prevState) => {
            return {
              ...prevState,
              requests: newRequests,
              numUnread: prevState.numUnread + changeUnread,
            };
          });
          break;

        case "Decline Friend Request":
          setFriendRequests((prevState) => {
            return {
              ...prevState,
              requests: newRequests,
              numUnread: prevState.numUnread + changeUnread,
            };
          });
          break;
        default:
          break;
      }
    }
    // eslint-disable-next-line
  }, [newFriendStatus]);

  const handleFriendNotifications = (event) => {
    const token = localStorage.getItem("token");
    axios.patch("/api/friend-requests", {
      headers: {
        "x-access-token": token,
      },
      params: {
        read: true,
      },
    });
    setFriendRequests({
      ...friendRequests,
      numUnread: 0,
    });
  };

  return (
    <div
      className={classes.Footer}
      style={{
        display: loggedIn ? "flex" : "none",
      }}
    >
      <FooterNav link={"/friend-requests"} onClick={handleFriendNotifications}>
        <BsFillPersonPlusFill className={classes.Icon}></BsFillPersonPlusFill>
        {friendRequests.numUnread > 0 ? (
          <p className={classes.NumNotifications}>{friendRequests.numUnread}</p>
        ) : null}
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
