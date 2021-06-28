import React, { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import classes from "./MainSection.module.css";
import Feed from "./Feed/Feed.js";
import Sidebar from "./Sidebar/Sidebar.js";
// import Modal from "../MovieSelectorComponents/Modal.js";
// import Backdrop from "../MovieSelectorComponents/Backdrop.js";
import { withRouter, useHistory } from "react-router-dom";
import axios from "../../axiosConfig.js";

export default function MainSection(props) {
  const history = useHistory();
  // render() {
  const subscriptions = useSelector((state) => {
    // console.log(state.subscriptions);
    return state.subscriptions;
  });

  const loggedIn = useSelector((state) => state.loggedIn);

  const ref = useRef(0);

  const [initPosts, setInitPosts] = useState({
    posts: [],
    userPics: [],
    loadMore: false,
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
            .post("/api/getPosts", {
              postIDs: [],
              userIDs: [],
              subscriptionIDs: subscriptionIDs,
              headers: {
                "x-access-token": localStorage.getItem("token"),
              },
            })
            .then((res) => {
              console.log("Fetched posts");
              // const { posts, userPics } = { ...res.data };
              // console.log(posts);
              const posts = res.data.posts;
              const userPics = new Map(JSON.parse(res.data.userPics));
              // console.log(posts);
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
  console.log(subscriptions);

  console.log(initPosts);
  return (
    <div className={classes.MainSection}>
      <Sidebar></Sidebar>
      <Feed history={history} initPosts={initPosts}></Feed>
      <div className={classes.TestClass}>
        {loggedIn ? <div className={classes.TestInner}></div> : null}
      </div>
    </div>
  );
  // }
}

// export default withRouter(MainSection);

// <Modal></Modal>
