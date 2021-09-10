import React, { useState, useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import classes from "./Feed.module.css";
import Post from "../Post/Post.js";
import PostSpinner from "../Post/PostSpinner.js";
import axios from "../../../axiosConfig.js";
import smile from "./smile.png";
import squareTest from "./SquareTestImage.png";
import Backdrop from "../../Backdrop/Backdrop.js";
import InfiniteScroll from "react-infinite-scroll-component";
import { useHistory } from "react-router-dom";

// import TextareaAutosize from "react-textarea-autosize";

export default function Feed(props) {
  //STATE VARIABLES
  // console.log(props.initPosts);
  // console.log("Rendering feed");
  // const showList = useSelector((state) => {
  //   return state.shows;
  // });

  const history = useHistory();

  const subscriptions = useSelector((state) => {
    // console.log(state.subscriptions);
    return state.subscriptions;
  });

  const profilePic = useSelector((state) => state.profilePic);
  const showFriendsDropdown = useSelector((state) => state.showFriendsDropdown);
  const newFriendStatus = useSelector((state) => state.newFriendStatus);
  const dispatch = useDispatch();

  // console.log(subscriptionIDs);

  const [shows, setShows] = useState([]);
  // console.log(shows);

  useEffect(() => {
    const subscriptionIDs =
      subscriptions && subscriptions.length > 0
        ? subscriptions.map((sub) => {
            return sub.show_id;
          })
        : null;
    if (subscriptions && subscriptions.length > 0) {
      axios
        .post("/api/getShowsFromSubscriptions", {
          headers: {
            "x-access-token": localStorage.getItem("token"),
          },
          subscriptionIDs: subscriptionIDs,
        })
        .then((res) => {
          if (res.data.auth) {
            // console.log("Setting shows from subscriptions useEffect");
            setShows(res.data.shows);
          } else {
            props.history.push("/login");
          }
        });
    }
  }, [subscriptions]);

  useEffect(() => {
    // if (newFriendStatus) {
    //   setPostState((prevState) => {
    //     return {
    //       ...prevState,
    //       posts: prevState.posts.map((post) => {
    //         if (newFriendStatus.user_id === post.user_id) {
    //           return {
    //             ...post,
    //             friend_status: newFriendStatus.friend_status,
    //           };
    //         } else {
    //           return post;
    //         }
    //       }),
    //     };
    //   });
    // }
  }, [newFriendStatus]);

  // const

  const [state, setState] = useState({
    imageArray: null,
    showImage: false,
    // showBackdrop: false,
    showDropdowns: false,
  });

  const likes = [];
  likes.length = 43;
  const tags = [
    // "ShadowAndBone", "TestingTag", "TestingTag2"
  ];
  const loremText =
    "Lorem ipsum dolor, sit amet consectetur adipisicing elit. Quidem inventore aut dicta non eaque dolorem iste quis praesentium, ipsa suscipit? Nihil quibusdam amet rerum possimus mollitia tempore, eligendi rem deserunt ea labore maxime qui officia totam pariatur veniam voluptates aliquam aliquid. Cum magnam animi cupiditate et quidem eum hic veniam? s";
  const commentBody =
    "orem ipsum dolor, sit amet consectetur adipisicing elit. Quidem inventore aut dicta non eaque dolorem iste quis praesentium, ipsa suscipit? Nihil quibusdam amet rerum possimus mollitia tempore, eligendi rem deserunt ea labore maxime qui officia totam pariatur veniam voluptates aliquam aliquid. Cum magnam animi cupiditate et quidem eum hic v";
  const comments = [{ commentBody: commentBody }];
  // console.log(props.initPosts);
  const [postState, setPostState] = useState({
    ...props.initPosts,
    showBackdrop: false,
  }); //userPics entries are of the form [userID, picture]
  // console.log(postState);
  const [newPosts, setNewPosts] = useState({ posts: [], userPics: new Map() });
  useEffect(() => {
    setPostState({ ...props.initPosts, showBackdrop: false });
  }, [props.initPosts]);
  const loggedIn = useSelector((state) => state.loggedIn);
  // console.log(subscriptions);
  // console.log(shows[0]);

  const setInitShow = (shows) => {
    if (shows.length > 0) {
      // console.log(shows[0]);
      return shows[0];
    } else {
      // console.log("Bloop");
      return null;
    }
  };
  // console.log(shows);
  const [currentShow, setCurrentShow] = useState(setInitShow(shows));
  // console.log(currentShow);

  const setInitSeason = (currentShow) => {
    if (currentShow && currentShow.episodes.length > 0) {
      // console.log(currentShow.episodes[0]);
      return currentShow.episodes[0];
    } else {
      // console.log("No episodes in show or show not loaded!");
      return null;
    }
  };

  const [currentSeason, setCurrentSeason] = useState(
    setInitSeason(currentShow)
  );

  const setInitEpisode = (currentSeason) => {
    if (currentSeason && currentSeason.episodes.length > 0) {
      // console.log("About to set init episode");
      // console.log(currentSeason.episodes[0]);
      return currentSeason.episodes[0];
    } else {
      return null;
    }
  };

  const [currentEpisode, setCurrentEpisode] = useState(
    setInitEpisode(currentSeason)
  );

  const [text, setText] = useState("");

  useEffect(() => {
    // console.log("UseEffect Shows");
    setCurrentShow(setInitShow(shows));
  }, [shows]);

  useEffect(() => {
    // console.log("Show has been changed");
    // console.log("UseEffect seasons");
    setCurrentSeason(setInitSeason(currentShow));
  }, [currentShow]);

  useEffect(() => {
    // console.log("Season has been changed");
    // console.log("UseEffect episodes");
    setCurrentEpisode(setInitEpisode(currentSeason));
  }, [currentSeason]);

  // const showImageClick = () => {
  //   axios.get("/api/getShowPosters").then((res) => {
  //     console.log(res.data.image);
  //     this.setState({ showImage: true, imageArray: res.data.image });
  //   });
  // };

  //FUNCTIONS
  const inputClickHandler = (event) => {
    // console.log(props);
    if (!loggedIn) {
      props.history.push("/login");
    } else {
      setPostState({ ...postState, showBackdrop: true });
    }
  };

  const handleBackdropClick = (event) => {
    if (event.target.className.includes("Backdrop_Backdrop")) {
      setPostState({ ...postState, showBackdrop: false });
    }
  };
  //
  const onAnnouncementSelect = (event) => {
    setState({ ...state, showDropdowns: false });
  };

  const onSpoilerSelect = (event) => {
    setState({ ...state, showDropdowns: true });
  };

  const onShowSelect = (event) => {
    // console.log("Show has been selected");
    const showTitle = event.target.value;
    // console.log(showTitle);
    shows.forEach((show) => {
      if (show.title === showTitle) {
        setCurrentShow(show);
      }
    });
  };

  const onSeasonSelect = (event) => {
    const seasonTitle = event.target.value;
    // console.log(currentShow);
    // console.log(seasonTitle);
    currentShow.episodes.forEach((season) => {
      if (season.season_name === seasonTitle) {
        setCurrentSeason(season);
      }
    });
  };

  const onEpisodeSelect = (event) => {
    const episodeTitle = event.target.value;
    currentSeason.episodes.forEach((episode) => {
      if (episode.title === episodeTitle) {
        setCurrentEpisode(episode);
      }
    });
  };

  const onTextAreaChange = (event) => {
    setText(event.target.value);
  };

  const submitPost = (event) => {
    // console.log("Text: " + text);
    // console.log(currentEpisode);
    // console.log(currentShow);

    const token = localStorage.getItem("token");
    // console.log(currentShow);
    if (state.showDropdowns) {
      axios
        .post("/api/postPost", {
          headers: {
            "x-access-token": localStorage.getItem("token"),
          },
          post_text: text,
          episode_air_date: currentEpisode.air_date,
          episode_order: currentEpisode.episodeOrder,
          tv_id: currentShow.tv_id,
          type: "spoiler",
          episode_number: currentEpisode.episode_number,
          season_number: currentEpisode.season_number,
          title: currentShow.title,
        })
        .then((res) => {
          // console.log(res.data);
          const posts = res.data.posts;
          console.log(posts);
          let newUserPics;
          const profilePicLoaded = newPosts.userPics.has(res.data.user_id);
          // console.log(profilePicLoaded);
          if (!profilePicLoaded) {
            newUserPics = new Map([[res.data.user_id, res.data.profile_pic]]);
          }
          // window.location.reload();
          // console.log(posts.concat(newPosts.posts));
          setNewPosts((prevState) => {
            // console.log(posts.concat(prevState.posts));
            return {
              ...prevState,
              posts: posts.concat(prevState.posts),
              userPics: profilePicLoaded
                ? prevState.userPics
                : new Map([...newUserPics, ...prevState.userPics]),
            };
          });
          setPostState({ ...postState, showBackdrop: false });
          setCurrentShow(shows[0]);
        });
    } else {
      axios
        .post("/api/postPost", {
          headers: {
            "x-access-token": localStorage.getItem("token"),
          },
          post_text: text,
          episode_air_date: currentEpisode.air_date,
          episode_order: currentEpisode.episodeOrder,
          tv_id: currentShow.tv_id,
          type: "announcement",
          episode_number: currentEpisode.episode_number,
          season_number: currentEpisode.season_number,
          title: currentShow.title,
        })
        .then((res) => {
          // console.log(res.data);
          const posts = res.data.posts;
          console.log(posts);
          let newUserPics;
          const profilePicLoaded = newPosts.userPics.has(res.data.user_id);
          if (!profilePicLoaded) {
            newUserPics = new Map([[res.data.user_id, res.data.profile_pic]]);
          }
          // window.location.reload();
          // console.log(posts.concat(newPosts.posts));
          setNewPosts((prevState) => {
            // console.log(posts.concat(prevState.posts));
            return {
              ...prevState,
              posts: posts.concat(prevState.posts),
              userPics: profilePicLoaded
                ? prevState.userPics
                : new Map([...newUserPics, ...prevState.userPics]),
            };
          });
          setPostState({ ...postState, showBackdrop: false });
          setCurrentShow(shows[0]);
        });
    }
    // setPostState({ ...postState, showBackdrop: false });
  };

  const deletePosts = (event, postID) => {
    axios.delete(`/api/posts/${postID}`, {
      headers: {
        "x-access-token": localStorage.getItem("token"),
      },
    });
    newPosts.posts.every((post) => {
      if (parseInt(post.post_id) === parseInt(postID)) {
        const newNewPosts = newPosts.posts.filter(
          (post) => parseInt(post.post_id) !== parseInt(postID)
        );
        setNewPosts({ ...newPosts, posts: newNewPosts });
        return false;
      } else {
        return true;
      }
    });
    postState.posts.every((post) => {
      if (parseInt(post.post_id) === parseInt(postID)) {
        const newPostStatePosts = postState.posts.filter(
          (post) => parseInt(post.post_id) !== parseInt(postID)
        );
        setPostState({ ...postState, posts: newPostStatePosts });
        return false;
      } else {
        return true;
      }
    });
  };
  // let profilePicBase64 = null;

  const getMorePosts = async () => {
    // console.log("Fetching posts");
    setTimeout(async () => {
      const subscriptionIDs =
        subscriptions && subscriptions.length > 0
          ? subscriptions.map((sub) => {
              return sub.show_id;
            })
          : null;
      if (subscriptionIDs) {
        await axios
          .post("/api/getPosts", {
            postIDs: postState.posts
              .map((post) => post.post_id)
              .concat(newPosts.posts.map((post) => post.post_id)),
            userIDs: Array.from(postState.userPics.keys()),
            subscriptionIDs: subscriptionIDs,
            headers: {
              "x-access-token": localStorage.getItem("token"),
            },
          })
          .then((res) => {
            // console.log("Fetched posts");
            // const { posts, userPics } = { ...res.data };
            // console.log(posts);
            const posts = res.data.posts;
            console.log(posts);
            const userPics = new Map(JSON.parse(res.data.userPics));
            // console.log(userPics);
            // console.log(postState);
            // console.log(posts);
            // console.log(posts);
            setPostState((prevState) => ({
              ...prevState,
              posts: prevState.posts.concat(posts),
              userPics: new Map([...prevState.userPics, ...userPics]),
              loadMore: true,
            }));
          });
      }
      // setPostState((prevState) => ({
      //   ...prevState,
      //   posts: prevState.posts.concat(blankArray),
      // }));
    }, 200);
  };

  const friendRequestHandler = (friend_status, user_id) => {
    // const token = localStorage.getItem("token");
    // console.log(tags.friendStatus);
    // if (friend_status === "Add Friend") {
    //   axios
    //     .post(`/api/friend-requests/${user_id}`, {
    //       headers: {
    //         "x-access-token": token,
    //       },
    //     })
    //     .then((res) => {
    //       if (res.data.success) {
    //         setPostState({
    //           ...postState,
    //           posts: postState.posts.map((post) => {
    //             if (post.user_id === user_id) {
    //               return {
    //                 ...post,
    //                 friend_status: "Unsend Friend Request",
    //               };
    //             } else {
    //               return post;
    //             }
    //           }),
    //         });
    //       }
    //     });
    // }
  };

  const linkto = (link) => {
    if (link === "login") {
      history.push("/login");
    } else {
      history.push("/registration");
    }
  };
  // console.log(shows);
  // console.log(currentShow);
  // console.log(currentSeason);
  //RETURN
  // console.log(postState.posts);
  // console.log(newPosts.posts.forEach((post) => console.log(post.tags)));
  return (
    <div className={classes.Feed}>
      {postState.showBackdrop ? (
        <Backdrop
          showBackdrop={postState.showBackdrop}
          onClick={handleBackdropClick}
        >
          <div className={classes.Modal}>
            <div className={classes.ModalTitle}>Enter post</div>
            <textarea
              className={classes.PostInput}
              onChange={onTextAreaChange}
            ></textarea>
            <form className={classes.RadioButtons}>
              <div style={{ display: "inline-block" }}>
                <input
                  name="Spoilers"
                  type="radio"
                  id="one"
                  onChange={onAnnouncementSelect}
                ></input>
                <label for="one">Announcement</label>
              </div>
              <div style={{ display: "inline-block" }}>
                <input
                  name="Spoilers"
                  type="radio"
                  id="two"
                  onChange={onSpoilerSelect}
                  defaultChecked
                ></input>
                <label for="two">Spoilers</label>
              </div>
            </form>

            <div className={classes.Dropdowns}>
              <select className={classes.Dropdown} onChange={onShowSelect}>
                {shows.map((show) => {
                  // console.log("Show11");
                  return <option id={show.show_id}>{show.title}</option>;
                })}
              </select>
              {state.showDropdowns && shows.length > 0 ? (
                <select className={classes.Dropdown} onChange={onSeasonSelect}>
                  {currentShow.episodes.map((season) => {
                    return (
                      <option id={season.season_id}>
                        {season.season_name}
                      </option>
                    );
                  })}
                </select>
              ) : null}
              {state.showDropdowns && shows.length > 0 ? (
                <select className={classes.Dropdown} onChange={onEpisodeSelect}>
                  {currentSeason.episodes.map((episode) => {
                    return (
                      <option id={episode.episode_id}>{episode.title}</option>
                    );
                  })}
                </select>
              ) : null}
            </div>

            <div className={classes.SubmitButtonContainer}>
              <button className={classes.SubmitButton} onClick={submitPost}>
                Submit Post
              </button>
            </div>
          </div>
        </Backdrop>
      ) : null}

      {loggedIn ? (
        <div className={classes.InputPost}>
          <img src={profilePic} className={classes.ProfilePic}></img>
          <input
            className={classes.InputPostInput}
            placeholder="Create a post..."
            onClick={inputClickHandler}
          ></input>
        </div>
      ) : null}
      {loggedIn ? null : <PostSpinner></PostSpinner>}
      {loggedIn
        ? newPosts.posts.map((post) => {
            // console.log(post.tags);
            return (
              <Post
                body={post.body}
                username={post.username}
                post_date={post.post_date.toString()}
                likes={post.likes}
                comments={post.comments}
                user_liked_post={post.user_liked_post}
                user_id={post.user_id}
                user_pic_map={newPosts.userPics}
                type={post.type}
                episode_tag={post.episode}
                tags={post.tags}
                friend_status={post.friend_status}
                post_id={post.post_id}
                num_likes={post.num_likes}
                delete_posts={deletePosts}
              ></Post>
            );
          })
        : null}
      {loggedIn ? (
        <InfiniteScroll
          dataLength={postState.posts.length}
          loader={<PostSpinner></PostSpinner>}
          next={getMorePosts}
          hasMore={postState.loadMore}
          scrollThreshold={0}
        >
          {postState.posts.map((post) => {
            // console.log(post.comments);
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
                friend_request_handler={() =>
                  friendRequestHandler(post.friend_status, post.user_id)
                }
                friend_status={post.friend_status}
                num_likes={post.num_likes}
                delete_posts={deletePosts}
              ></Post>
            );
          })}
        </InfiniteScroll>
      ) : null}
    </div>
  );
}
