import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import classes from "./FriendRequests.module.css";
import RequestBox from "./RequestBox/RequestBox.js";
import axios from "../../axiosConfig";

const FriendRequests = (props) => {
  const [state, setState] = useState({ requests: [], isLoaded: false });
  const loggedIn = useSelector((state) => state.loggedIn);
  const dispatch = useDispatch();

  const updateFriendRequests = () => {
    if (!loggedIn) return;
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
      .then((response) => {
        setState({ requests: response.data.friend_requests, isLoaded: true });
      });
  };

  useEffect(updateFriendRequests, []);
  useEffect(updateFriendRequests, [loggedIn]);

  const acceptRequest = (event, sender_id) => {
    console.log(state.requests);
    const id = parseInt(sender_id);

    const filteredRequests = state.requests.filter(
      (req) => parseInt(req.sender_id) !== id
    );
    const selectedRequest = state.requests.filter(
      (req) => parseInt(req.sender_id) === id
    )[0];

    axios.post(`/api/friends/${id}`, {
      headers: {
        "x-access-token": localStorage.getItem("token"),
      },
    });
    dispatch({
      type: "NEW FRIEND STATUS",
      newFriendStatus: {
        update: "Accept Friend Request",
        userID: id,
        profilePic: selectedRequest.profile_pic,
        username: selectedRequest.username,
      },
    });
    setState((state) => {
      return {
        ...state,
        requests: filteredRequests,
      };
    });
  };

  const declineRequest = (event, sender_id) => {
    const id = parseInt(sender_id);

    const filteredRequests = state.requests.filter(
      (req) => parseInt(req.sender_id) !== id
    );
    const selectedRequest = state.requests.filter(
      (req) => parseInt(req.sender_id) === id
    )[0];

    axios.delete(`/api/friend-requests/${id}`, {
      headers: {
        "x-access-token": localStorage.getItem("token"),
      },
    });

    dispatch({
      type: "NEW FRIEND STATUS",
      newFriendStatus: {
        update: "Decline Friend Request",
        userID: id,
      },
    });

    setState((state) => {
      return {
        ...state,
        requests: filteredRequests,
      };
    });
  };

  return (
    <div className={classes.RequestList}>
      <h2 className={classes.Title}>Friend Requests</h2>
      {!state.isLoaded ? (
        <div className={classes.LoaderContainer}>
          <div className={classes.loader}></div>
        </div>
      ) : null}
      {state.isLoaded && state.requests.length === 0 ? (
        <div className={classes.WarningContainer}>
          <p className={classes.Warning}>You have no friend requests</p>
        </div>
      ) : null}
      {state.requests.map((request) => {
        return (
          <RequestBox
            request={request}
            accept={(_) => acceptRequest(_, parseInt(request.sender_id))}
            decline={(_) => declineRequest(_, parseInt(request.sender_id))}
          ></RequestBox>
        );
      })}
    </div>
  );
};

export default FriendRequests;
