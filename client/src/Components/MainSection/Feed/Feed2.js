import React, { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import classes from "./Feed.module.css";
import Post from "../Post/Post.js";
import PostSpinner from "../Post/PostSpinner.js";
import axios from "../../../axiosConfig.js";
import InfiniteScroll from "react-infinite-scroll-component";
import qs from "qs";

export default function Feed(props) {
  const subscriptions = useSelector((state) => {
    return state.subscriptions;
  });
  const [postState, setPostState] = useState({
    posts: [],
    userPics: new Map(),
  });
  const [newPosts, setNewPosts] = useState({ posts: [] });
  const postString = useRef("");

  const convertIDsToString = (IDList) => {
    if (IDList.length === 0) return "";
    return IDList.join("-");
  };

  const deletePosts = () => {};

  useEffect(() => {
    const subscriptionIDs =
      subscriptions && subscriptions.length > 0
        ? subscriptions.map((sub) => {
            return sub.show_id;
          })
        : null;
    if (subscriptionIDs) {
      if (postString.current === convertIDsToString(subscriptionIDs)) {
        return;
      } else {
        postString.current = convertIDsToString(subscriptionIDs);
        console.log(subscriptionIDs);
        axios
          .get("/api/posts", {
            params: {
              postIDs: postState.posts.map((post) => post.post_id),
              userIDs: Array.from(postState.userPics.keys()),
              subscriptionIDs: subscriptionIDs,
            },
            paramsSerializer: (params) => {
              return qs.stringify(params);
            },
            headers: {
              "x-access-token": localStorage.getItem("token"),
            },
          })
          .then((res) => {
            setPostState({ ...postState, posts: res.data.posts });
          });
      }
    }
  }, [subscriptions]);

  const getMorePosts = () => {
    console.log("Get more posts");
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
            postIDs: postState.posts
              .map((post) => post.post_id)
              .concat(newPosts.posts.map((post) => post.post_id)),
            userIDs: Array.from(postState.userPics.keys()),
            subscriptionIDs: subscriptionIDs,
          },
          paramsSerializer: (params) => {
            return qs.stringify(params);
          },
          headers: {
            "x-access-token": localStorage.getItem("token"),
          },
        })
        .then((res) => {
          setPostState((prevState) => {
            console.log(prevState.posts.concat(res.data.posts));
            return {
              ...prevState,
              posts: prevState.posts.concat(res.data.posts),
            };
          });
        });
    }
  };

  return (
    <div className={classes.Feed}>
      <InfiniteScroll
        dataLength={postState.posts.length}
        loader={<PostSpinner></PostSpinner>}
        next={getMorePosts}
        hasMore={true}
        scrollThreshold={75}
      >
        {postState.posts.map((post) => {
          return (
            <Post
              body={post.body}
              username={post.username}
              post_date={post.post_date.toString()}
              likes={post.likes}
              comments={post.comments}
              user_liked_post={post.user_liked_post}
              user_id={post.user_id}
              user_pic_map={postState.userPics}
              type={post.type}
              episode_tag={post.episode}
              tags={post.tags}
              post_id={post.post_id}
              friend_status={post.friend_status}
              num_likes={post.num_likes}
              delete_posts={deletePosts}
            ></Post>
          );
        })}
      </InfiniteScroll>
    </div>
  );
}
