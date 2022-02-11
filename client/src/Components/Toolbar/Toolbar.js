import React, { useState, useEffect, useRef } from "react";
import classes from "./Toolbar.module.css";
import NavigationItems from "../NavigationItems/NavigationItems.js";
import NavigationItem from "../NavigationItems/NavigationItem/NavigationItem.js";
import { useSelector, useDispatch } from "react-redux";
import { useLocation } from "react-router-dom";
import useOnClickOutside from "../../Helpers/useOnClickOutside.js";
import { FaUserFriends } from "react-icons/fa";
import { AiFillCaretDown } from "react-icons/ai";
import { GiHamburgerMenu } from "react-icons/gi";
import axios from "../../axiosConfig.js";

const Toolbar = (props) => {
  const loggedIn = useSelector((state) => state.loggedIn);
  const windowWidth = useSelector((state) => state.windowWidth);
  const windowHeight = useSelector((state) => state.windowHeight);
  const username = useSelector((state) => state.username);
  const [friendRequests, setFriendRequests] = useState({
    requests: [],
    showDropdown: false,
    numUnread: 0,
  });
  const [showMobileDropdown, setShowMobileDropdown] = useState(false);
  const newFriendStatus = useSelector((state) => state.newFriendStatus);
  const changedID = useRef(null);
  const ref = useRef();
  useOnClickOutside(ref, () => {
    setShowMobileDropdown(false);
  });
  const dispatch = useDispatch();

  const pathname = useLocation().pathname;

  const logout = () => {
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

    if (!friendRequests.showDropdown) {
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
    const FriendRequestDropdown = document.getElementById(
      "FriendRequestDropdown"
    );
    const FriendRequestDropdownIcon = document.getElementById(
      "FriendRequestDropdownIcon"
    );
    if (FriendRequestDropdown) {
      if (
        FriendRequestDropdownIcon.contains(event.target) ||
        event.target.id.includes("AcceptButton") ||
        event.target.id.includes("DeclineButton")
      ) {
        if (event.target.id.includes("AcceptButton")) {
          const id = parseInt(event.target.id.slice(13));

          const filteredRequests = friendRequests.requests.filter(
            (req) => parseInt(req.sender_id) !== id
          );
          const selectedRequest = friendRequests.requests.filter(
            (req) => parseInt(req.sender_id) === id
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
          console.log("handling decline");
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
                (req) => parseInt(req.sender_id) !== id
              ),
            };
          });
          // previous condition: else if and condition was !FriendRequestDropdown.contains(event.target)
        } else {
          const id = changedID.current;
          const filteredRequests = friendRequests.requests.filter(
            (req) => parseInt(req.sender_id) !== id
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
        if (res.data.friend_requests) {
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

  const openMobileDropdown = (event) => {
    setShowMobileDropdown(true);
  };

  const displaySidebar = (event) => {
    dispatch({ type: "DISPLAY SIDEBAR" });
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
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
    // eslint-disable-next-line
  }, [loggedIn]);

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
                    alt="Not found"
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
      <nav className={classes.MobileOnly}>
        <GiHamburgerMenu
          className={classes.SidebarMenu}
          onClick={displaySidebar}
        ></GiHamburgerMenu>
        <p className={classes.Username}>{username}</p>
        <AiFillCaretDown
          className={classes.DropdownIcon}
          onClick={openMobileDropdown}
          style={{
            color: showMobileDropdown ? "var(--nord7)" : "var(--nord5)",
          }}
        ></AiFillCaretDown>
      </nav>
      {showMobileDropdown ? (
        <div className={classes.MobileDropdown} ref={ref}>
          {" "}
          <p className={classes.MobileLogout} onClick={logout}>
            Logout
          </p>{" "}
        </div>
      ) : null}
    </header>
  );
};

export default Toolbar;
