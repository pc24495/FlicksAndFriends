import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import classes from "./Friends.module.css";
import axios from "../../axiosConfig.js";

const Friends = (props) => {
  const [state, setState] = useState({ friends: [], isLoaded: false });
  const newFriendStatus = useSelector((state) => state.newFriendStatus);
  const dispatch = useDispatch();

  useEffect(() => {
    const token = localStorage.getItem("token");
    axios
      .get("/api/friends", {
        headers: {
          "x-access-token": token,
        },
      })
      .then((response) => {
        console.log(response.data);
        // setState({ requests: response.data.friend_requests, isLoaded: true });
      });
  }, []);

  return (
    <div className={classes.FriendsList}>
      {state.isLoaded && state.friends.length === 0 ? (
        <div className={classes.WarningContainer}>
          <p className={classes.Warning}>
            You have no friends. Hover over the username of a post you like and
            click "Add Friend" to send a friend request.
          </p>
        </div>
      ) : null}
    </div>
  );
};

export default Friends;
