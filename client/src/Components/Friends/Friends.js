import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import classes from "./Friends.module.css";
import axios from "../../axiosConfig.js";
import FriendBox from "./FriendBox/FriendBox";

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
        setState({ friends: response.data.friends, isLoaded: true });
      });
  }, []);

  const removeFriend = (event, id) => {
    axios.delete(`/api/friends/${id}`, {
      headers: {
        "x-access-token": localStorage.getItem("token"),
      },
    });
    setState({
      ...state,
      friends: state.friends.filter(
        (friend) => parseInt(friend.user_id) !== id
      ),
    });
  };

  return (
    <div className={classes.FriendsList}>
      <h2 className={classes.Title}>Friends</h2>
      {!state.isLoaded ? (
        <div className={classes.LoaderContainer}>
          <div className={classes.loader}></div>
        </div>
      ) : null}
      {state.isLoaded && state.friends.length === 0 ? (
        <div className={classes.WarningContainer}>
          <p className={classes.Warning}>
            You have no friends. To send someone a friend request, hover over
            their username on one of their posts and click "Add Friend".
          </p>
        </div>
      ) : null}
      {state.isLoaded &&
        state.friends.length > 0 &&
        state.friends.map((friend) => (
          <FriendBox
            friend={friend}
            remove={(event) => removeFriend(event, parseInt(friend.user_id))}
          ></FriendBox>
        ))}
    </div>
  );
};

export default Friends;
