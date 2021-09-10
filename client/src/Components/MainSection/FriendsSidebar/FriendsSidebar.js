import React, { useState, useEffect } from "react";
import classes from "./FriendsSidebar.module.css";
import { useSelector, useDispatch } from "react-redux";
import axios from "../../../../../server/node_modules/axios";
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
          // console.log(res.data);
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
          (friend) => friend.user_id != userID
        ),
      };
    });
  };

  useEffect(() => {
    // console.log(newFriendStatus);
    // console.log(typeof props.user_id);
    // console.log(typeof newFriendStatus.userID);
    // console.log(Object.keys(newFriendStatus).length);
    if (Object.keys(newFriendStatus).length !== 0) {
      switch (newFriendStatus.update) {
        // case "Add Friend":
        //   axios
        //     .get(`/api/friends/${newFriendStatus.userID}`, {
        //       headers: {
        //         "x-access-token": localStorage.getItem("token"),
        //       },
        //     })
        //     .then((res) => {
        //       if (res.data.sucess) {
        //         const newFriendsList = state.friendsList.append(
        //           res.data.friends
        //         );
        //         setState({ ...state, friendsList: newFriendsList });
        //       }
        //     });
        //   break;
        // case "Unsend Friend Request":
        //   setTags({ ...tags, friendStatus: "Add Friend" });
        //   break;
        case "Accept Friend Request":
          console.log("Accepting");
          const newFriendsListAccepting = state.friendsList.concat([
            {
              username: newFriendStatus.username,
              user_id: newFriendStatus.user_id,
              profile_pic: newFriendStatus.profilePic,
            },
          ]);
          setState({ ...state, friendsList: newFriendsListAccepting });
          break;
        case "Unfriend User":
          const newFriendsListUnfriending = state.friendsList.filter(
            (friend) =>
              parseInt(friend.user_id) != parseInt(newFriendStatus.userID)
          );
          setState({ ...state, friendsList: newFriendsListUnfriending });
          break;
        // case "Decline Friend Request":
        //   setTags({ ...tags, friendStatus: "Add Friend" });
        //   break;
      }
    }
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

// {state.friendsList.map((friend) => {
//   <div>{friend.username}</div>;
// })}
