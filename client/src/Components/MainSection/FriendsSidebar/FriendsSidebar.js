import React, { useState, useEffect } from "react";
import classes from "./FriendsSidebar.module.css";
import { useSelector, useDispatch } from "react-redux";
import axios from "../../../axiosConfig.js";
import FriendBox from "./FriendBox/FriendBox.js";

const FriendsSidebar = (props) => {
  const loggedIn = useSelector((state) => state.loggedIn);
  const [state, setState] = useState({ friendsList: [], isLoaded: false });
  const newFriendStatus = useSelector((state) => state.newFriendStatus);
  const dispatch = useDispatch();

  useEffect(() => {
    const token = localStorage.getItem("token");
    axios
      .get("/api/friends", {
        headers: {
          "x-access-token": token,
        },
        params: {
          profile_pics: true,
          usernames: true,
          user_id: true,
        },
      })
      .then((res) => {
        if (res.data.success) {
          setState({ isLoaded: true, friendsList: res.data.friends });
        }
      });
  }, []);

  const removeFriend = (event, userID) => {
    // console.log(userID);
    // console.log(state.friendsList);
    axios.delete(`/api/friends/${userID}`, {
      headers: {
        "x-access-token": localStorage.getItem("token"),
      },
    });
    dispatch({
      type: "NEW FRIEND STATUS",
      newFriendStatus: {
        update: "Unfriend User",
        userID: userID,
      },
    });
    setState((prevState) => {
      return {
        ...prevState,
        friendsList: prevState.friendsList.filter(
          (friend) => friend.user_id !== userID
        ),
      };
    });
  };

  useEffect(() => {
    if (Object.keys(newFriendStatus).length !== 0) {
      switch (newFriendStatus.update) {
        case "Accept Friend Request":
          const newFriendsListAccepting = state.friendsList.concat([
            {
              username: newFriendStatus.username,
              user_id: newFriendStatus.userID,
              profile_pic: newFriendStatus.profilePic,
            },
          ]);
          setState({ ...state, friendsList: newFriendsListAccepting });
          break;
        case "Unfriend User":
          const newFriendsListUnfriending = state.friendsList.filter(
            (friend) =>
              parseInt(friend.user_id) !== parseInt(newFriendStatus.userID)
          );
          setState({ ...state, friendsList: newFriendsListUnfriending });
          break;
        default:
        // case "Decline Friend Request":
        //   setTags({ ...tags, friendStatus: "Add Friend" });
        //   break;
      }
    }
    // eslint-disable-next-line
  }, [newFriendStatus]);

  return (
    <div className={classes.FriendsSidebar}>
      {loggedIn && !state.isLoaded ? (
        <div className={classes.FriendsSidebarInnerNotLoaded}>
          <div className={classes.loader}></div>
        </div>
      ) : null}
      {loggedIn && state.isLoaded ? (
        <div className={classes.FriendsSidebarInner}>
          {state.friendsList.length === 0 && (
            <p>
              You have no friends, hover over someone's username to send them a
              friend request.{" "}
            </p>
          )}
          {state.friendsList.map((friend) => {
            return (
              <FriendBox
                username={friend.username}
                profilePic={friend.profile_pic}
                user_id={friend.user_id}
                remove_friend={removeFriend}
              ></FriendBox>
            );
          })}
        </div>
      ) : null}
    </div>
  );
};

export default FriendsSidebar;
