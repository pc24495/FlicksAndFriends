import React, { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import classes from "./MainSection.module.css";
import Feed from "./Feed/Feed.js";
import Sidebar from "./Sidebar/Sidebar.js";
import FriendsSidebar from "./FriendsSidebar/FriendsSidebar.js";
import { useHistory } from "react-router-dom";
import axios from "../../axiosConfig.js";
import qs from "qs";

export default function MainSection(props) {
  const history = useHistory();
  const subscriptions = useSelector((state) => {
    return state.subscriptions;
  });

  const ref = useRef(0);

  const [initPosts, setInitPosts] = useState({
    posts: [],
    userPics: [],
    loadMore: true,
  });

  useEffect(() => {
    if (ref.current === 0 && subscriptions) {
      if (subscriptions.length > 0) {
        ref.current = subscriptions.length;
        const subscriptionIDs =
          subscriptions && subscriptions.length > 0
            ? subscriptions.map((sub) => {
                return sub.show_id;
              })
            : null;
        if (subscriptionIDs) {
          axios
            .get("/api/posts", {
              params: {
                subscriptionIDs,
                postIDs: [],
                userIDs: [],
              },
              paramsSerializer: (params) => {
                return qs.stringify(params);
              },
              headers: {
                "x-access-token": localStorage.getItem("token"),
              },
            })
            .then((res) => {
              const posts = res.data.posts;
              const userPics = new Map(JSON.parse(res.data.userPics));
              setInitPosts((prevState) => ({
                ...prevState,
                posts: prevState.posts.concat(posts),
                userPics: new Map([...prevState.userPics, ...userPics]),
                loadMore: true,
              }));
            });
        }
      }
    }
  }, [subscriptions]);

  return (
    <div className={classes.MainSection}>
      <Sidebar></Sidebar>
      <Feed history={history} initPosts={initPosts}></Feed>
      <FriendsSidebar></FriendsSidebar>
    </div>
  );
  // }
}

// <div className={classes.TestClass}>
// {loggedIn ? (
//   <div className={classes.TestInner}>Friends: coming soon!</div>
// ) : null}
// </div>

// export default withRouter(MainSection);

// <Modal></Modal>
