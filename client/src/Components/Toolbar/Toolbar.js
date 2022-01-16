import React, { useState, useRef } from "react";
import classes from "./Toolbar.module.css";
import NavigationItems from "../NavigationItems/NavigationItems.js";
import NavigationItem from "../NavigationItems/NavigationItem/NavigationItem.js";
import { useSelector, useDispatch } from "react-redux";
import { useLocation } from "react-router-dom";
import { FaUserFriends } from "react-icons/fa";
import { AiFillCaretDown } from "react-icons/ai";
import { useEffect } from "react";
import axios from "../../../../server/node_modules/axios";
// import axios from "../../axiosConfig.js";

const Toolbar = (props) => {
  const loggedIn = useSelector((state) => state.loggedIn);
  const windowWidth = useSelector((state) => state.windowWidth);
  const windowHeight = useSelector((state) => state.windowHeight);
  const [friendRequests, setFriendRequests] = useState({
    requests: [],
    showDropdown: false,
    numUnread: 0,
  });
  const newFriendStatus = useSelector((state) => state.newFriendStatus);
  const changedID = useRef(null);
  // const counter = useSelector((state) => state.counter);

  const dispatch = useDispatch();

  // console.log(loggedIn); //
  const pathname = useLocation().pathname;
  // console.log(pathname);

  const logout = () => {
    console.log("LOGGING OUT");
    localStorage.removeItem("token");
    dispatch({ type: "LOGOUT" });
  };

  const updateSearch = (event) => {
    setTimeout(
      () => dispatch({ type: "SEARCH", searchValue: event.target.value }),
      300
    );
  };

  const handleFriendNotifications = (event) => {
    const token = localStorage.getItem("token");
    // console.log(friendRequests);

    if (!friendRequests.showDropdown) {
      // console.log("opening dropdown");
      axios.patch("/api/friend-requests", {
        headers: {
          "x-access-token": token,
        },
        params: {
          read: true,
        },
      });

      setTimeout(() => {
        document.addEventListener("click", closeFriendsDropdown);
      }, 20);

      // console.log("opening dropdown");
      const newRequests = friendRequests.requests.map((req) => {
        return { ...req, read: true };
      });
      setFriendRequests({
        ...friendRequests,
        requests: newRequests,
        showDropdown: true,
        numUnread: 0,
      });
    }
  };

  const closeFriendsDropdown = (event) => {
    // console.log("bla");
    const FriendRequestDropdown = document.getElementById(
      "FriendRequestDropdown"
    );
    const FriendRequestDropdownIcon = document.getElementById(
      "FriendRequestDropdownIcon"
    );
    // console.log(event.target);
    // console.log(FriendRequestDropdown.contains(event.target));
    if (FriendRequestDropdown) {
      if (
        FriendRequestDropdownIcon.contains(event.target) ||
        event.target.id.includes("AcceptButton") ||
        event.target.id.includes("DeclineButton")
      ) {
        if (event.target.id.includes("AcceptButton")) {
          // console.log("handling accept!!!");
          // console.log(event.target.id.slice(13));
          const id = parseInt(event.target.id.slice(13));
          // console.log(friendRequests.requests);
          console.log(friendRequests.requests[0].sender_id);
          console.log(id);
          const filteredRequests = friendRequests.requests.filter(
            (req) => parseInt(req.sender_id) != id
          );
          const selectedRequest = friendRequests.requests.filter(
            (req) => parseInt(req.sender_id) == id
          )[0];
          changedID.current = id;
          // console.log(filteredRequests);
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
          setFriendRequests((friendRequests) => {
            return {
              ...friendRequests,
              requests: filteredRequests,
            };
          });
        } else if (event.target.id.includes("DeclineButton")) {
          // console.log("handling decline");
          const id = parseInt(event.target.id.slice(14));
          changedID.current = id;
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
          setFriendRequests((friendRequests) => {
            return {
              ...friendRequests,
              requests: friendRequests.requests.filter(
                (req) => parseInt(req.sender_id) != id
              ),
            };
          });
          // previous condition: else if and condition was !FriendRequestDropdown.contains(event.target)
        } else {
          // console.log("closing dropdown");
          // console.log(friendRequests);
          const id = changedID.current;
          const filteredRequests = friendRequests.requests.filter(
            (req) => parseInt(req.sender_id) != id
          );
          document.removeEventListener("click", closeFriendsDropdown);
          setFriendRequests({
            requests: filteredRequests,
            numUnread: 0,
            showDropdown: false,
          });
        }
      } else {
        document.removeEventListener("click", closeFriendsDropdown);
        setFriendRequests({
          ...friendRequests,
          numUnread: 0,
          showDropdown: false,
        });
      }
    }
  };

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
        // console.log(res.data);
        if (res.data.friend_requests) {
          setFriendRequests({
            ...friendRequests,
            requests: res.data.friend_requests,
            numUnread: res.data.num_unread,
          });
        }
      });
    return () => {};
  }, []);

  const handleAccept = (event, id) => {
    // console.log("handling accept");
    setFriendRequests((friendRequests) => {
      return {
        ...friendRequests,
        requests: friendRequests.requests.filter((req) => req.sender_id != id),
      };
    });
  };

  const handleDecline = (event, id) => {
    setFriendRequests((friendRequests) => {
      return {
        ...friendRequests,
        requests: friendRequests.requests.filter((req) => req.sender_id != id),
      };
    });
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    // console.log(friendRequests);
    if (loggedIn && friendRequests.requests.length === 0) {
      axios
        .get("/api/friend-requests", {
          headers: {
            "x-access-token": token,
          },
          params: {
            profile_pics: false,
            usernames: true,
          },
        })
        .then((res) => {
          // console.log(res.data);
          if (res.data.friend_requests) {
            setFriendRequests({
              ...friendRequests,
              requests: res.data.friend_requests,
              numUnread: res.data.num_unread,
            });
          }
        });
    } else if (!loggedIn) {
      setFriendRequests({ requests: [], showDropdown: false, numUnread: 0 });
    }
    return () => {};
  }, [loggedIn]);

  useEffect(() => {
    // console.log(newFriendStatus);
    if (Object.keys(newFriendStatus).length !== 0) {
      switch (newFriendStatus.update) {
        case "Accept Friend Request":
          console.log(friendRequests.requests[0]);
          const isInNotifications = friendRequests.requests.find(
            (friend) =>
              parseInt(friend.sender_id) === parseInt(newFriendStatus.userID)
          );
          let changeUnread = 0;
          if (!(isInNotifications === undefined)) {
            changeUnread = -1;
          }
          const newRequests = friendRequests.requests.filter(
            (req) => parseInt(req.sender_id) != parseInt(newFriendStatus.userID)
          );
          setFriendRequests((prevState) => {
            return {
              ...prevState,
              requests: newRequests,
              numUnread: prevState.numUnread + changeUnread,
            };
          });
          break;

        case "Decline Friend Request":
        // setTags({ ...tags, friendStatus: "Add Friend" });
        // break;
      }
    }
  }, [newFriendStatus]);

  // <div className={classes.Notification}></div>
  return (
    <header
      className={classes.Toolbar}
      style={{
        display: loggedIn ? "flex" : "none",
      }}
    >
      {friendRequests.showDropdown ? (
        <div className={classes.FriendsDropdown} id="FriendRequestDropdown">
          {friendRequests.requests.length > 0 ? (
            friendRequests.requests.map((friendRequest) => {
              return (
                <div className={classes.Notification}>
                  <img
                    src={friendRequest.profile_pic}
                    className={classes.NotificationProfilePic}
                  ></img>
                  <div className={classes.NotificationBody}>
                    <p className={classes.FriendRequestUsername}>
                      {friendRequest.username}
                    </p>
                    <div className={classes.ButtonContainer}>
                      <button
                        className={[classes.Button, classes.Button1].join(" ")}
                        id={`AcceptButton-${friendRequest.sender_id}`}
                      >
                        Accept
                      </button>
                      <button
                        className={[classes.Button, classes.Button2].join(" ")}
                        id={`DeclineButton-${friendRequest.sender_id}`}
                      >
                        Decline
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className={classes.Notification}>
              <p className={classes.NoRequests}>No friend requests</p>
            </div>
          )}
        </div>
      ) : null}
      <nav className={classes.DesktopOnly}>
        <NavigationItems>
          <p>
            {windowWidth} {windowHeight}
          </p>
          <input
            className={classes.SearchBar}
            style={{
              display: pathname === "/subscriptions" ? "block" : "none",
            }}
            onChange={updateSearch}
          ></input>
          <div
            className={classes.FriendsIconOuter}
            onClick={handleFriendNotifications}
            id="FriendRequestDropdownIcon"
          >
            <FaUserFriends className={classes.FriendsIcon}></FaUserFriends>
            {friendRequests.numUnread > 0 ? (
              <p className={classes.NumNotifications}>
                {friendRequests.numUnread}
              </p>
            ) : null}
          </div>
          <NavigationItem link="/" exact>
            Home
          </NavigationItem>
          {loggedIn ? (
            <div className={classes.Logout} onClick={logout}>
              <p>Logout</p>
            </div>
          ) : null}

          {loggedIn ? null : (
            <NavigationItem link="/registration">Registration</NavigationItem>
          )}
          {loggedIn ? null : (
            <NavigationItem link="/login">Login</NavigationItem>
          )}
        </NavigationItems>
      </nav>
    </header>
  );
};

// <p>
//           {windowWidth} {windowHeight}
//         </p>
export default Toolbar;
