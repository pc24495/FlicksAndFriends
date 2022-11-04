import useFetch from "../../../Helpers/useFetch.js";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { useSelector } from "react-redux";
import classes from "./Feed.module.css";
import Post from "../Post/Post.js";
import PostSpinner from "../Post/PostSpinner.js";
import Backdrop from "../../Backdrop/Backdrop.js";
import axios from "../../../axiosConfig.js";
import InfiniteScroll from "react-infinite-scroll-component";
import qs from "qs";

function Feed(props) {
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [removedID, setRemovedID] = useState(null);
  const subscriptions = useSelector((state) => {
    return state.subscriptions;
  });
  const profilePic = useSelector((state) => state.profilePic);
  const loggedIn = useSelector((state) => state.loggedIn);
  const { loading, error, postList, done, userPicsMap } = useFetch(
    query,
    page,
    subscriptions,
    removedID
  );
  const [newPostState, setNewPostState] = useState({
    showBackdrop: false,
    showDropdowns: true,
    posts: [],
    shows: [],
    currentShow: { episodes: [] },
    currentSeason: { episodes: [] },
    currentEpisode: {},
    show: "0",
    season: "0",
    episode: "0",
    text: "",
    userPics: new Map(),
  });
  const loader = useRef(null);
  const ref = useRef();

  function useOnClickOutside(ref, handler) {
    useEffect(
      () => {
        const listener = (event) => {
          // Do nothing if clicking ref's element or descendent elements
          if (!ref.current || ref.current.contains(event.target)) {
            return;
          }
          handler(event);
        };
        document.addEventListener("mousedown", listener);
        document.addEventListener("touchstart", listener);
        return () => {
          document.removeEventListener("mousedown", listener);
          document.removeEventListener("touchstart", listener);
        };
      },
      // Add ref and handler to effect dependencies
      // It's worth noting that because passed in handler is a new ...
      // ... function on every render that will cause this effect ...
      // ... callback/cleanup to run every render. It's not a big deal ...
      // ... but to optimize you can wrap handler in useCallback before ...
      // ... passing it into this hook.
      [ref, handler]
    );
  }

  useOnClickOutside(ref, () =>
    setNewPostState((state) => {
      return { ...state, showBackdrop: false };
    })
  );

  const handleObserver = useCallback((entries) => {
    const target = entries[0];
    if (target.isIntersecting) {
      setPage((prev) => prev + 1);
    }
  }, []);

  const deletePosts = (event, id) => {
    const postToBeDeleted = postList.find((post) => 12 === post.post_id);
    // console.log(postToBeDeleted);
    // if (postToBeDeleted) {
    //   console.log("Found");
    // } else {
    //   console.log("Not found");
    // }
    // console.log(id);
    // console.log(newPostState.posts);

    if (postList.find((post) => id === post.post_id)) {
      axios.delete(`/api/posts/${id}`, {
        headers: {
          "x-access-token": localStorage.getItem("token"),
        },
      });
      setRemovedID(id);
    } else if (newPostState.posts.find((post) => id === post.post_id)) {
      axios.delete(`/api/posts/${id}`, {
        headers: {
          "x-access-token": localStorage.getItem("token"),
        },
      });
      setNewPostState((prev) => {
        return {
          ...prev,
          posts: prev.posts.filter((post) => post.post_id !== id),
        };
      });
    }
  };

  const onTextAreaChange = (event) => {
    setNewPostState({ ...newPostState, text: event.target.value });
  };

  const onAnnouncementSelect = (event) => {
    setNewPostState({ ...newPostState, showDropdowns: false });
  };

  const onSpoilerSelect = (event) => {
    setNewPostState({ ...newPostState, showDropdowns: true });
  };

  const onShowSelect = (event) => {
    const selected_show_tv_id = parseInt(event.target.value);
    const selectedShow = newPostState.shows.find((show) => {
      return show.tv_id === selected_show_tv_id;
    });
    setNewPostState({
      ...newPostState,
      currentShow: selectedShow,
      currentSeason: selectedShow.episodes[0],
      currentEpisode: selectedShow.episodes[0].episodes[0],
    });
  };

  const onSeasonSelect = (event) => {
    const selected_season_season_id = parseInt(event.target.value);
    const selectedSeason = newPostState.currentShow.episodes.find((season) => {
      return season.season_id === selected_season_season_id;
    });
    setNewPostState({
      ...newPostState,
      currentSeason: selectedSeason,
      currentEpisode: selectedSeason.episodes[0],
    });
  };

  const onEpisodeSelect = (event) => {
    const selected_episode_episode_id = parseInt(event.target.value);
    const selectedEpisode = newPostState.currentSeason.episodes.find(
      (episode) => {
        return episode.episode_id === selected_episode_episode_id;
      }
    );
    setNewPostState({
      ...newPostState,
      currentEpisode: selectedEpisode,
    });
  };

  const submitPost = (event) => {
    event.preventDefault();
    const token = localStorage.getItem("token");
    if (newPostState.showDropdowns) {
      axios
      .post("/api/posts", {
          headers: {
            "x-access-token": token,
          },
          post_text: newPostState.text,
          episode_air_date: newPostState.currentEpisode.air_date,
          episode_order: newPostState.currentEpisode.episodeOrder,
          tv_id: newPostState.currentShow.tv_id,
          type: "spoiler",
          episode_number: newPostState.currentEpisode.episode_number,
          season_number: newPostState.currentEpisode.season_number,
          title: newPostState.currentShow.title,
        })
        .then((res) => {
          const posts = res.data.posts;
          // console.log(posts);
          let newUserPics;
          const profilePicLoaded = newPostState.userPics.has(res.data.user_id);
          // console.log(profilePicLoaded);
          if (!profilePicLoaded) {
            newUserPics = new Map([[res.data.user_id, res.data.profile_pic]]);
          }
          // window.location.reload();
          // console.log(posts.concat(newPosts.posts));
          setNewPostState((prevState) => {
            // console.log(posts.concat(prevState.posts));
            return {
              ...prevState,
              posts: posts.concat(prevState.posts),
              userPics: profilePicLoaded
                ? prevState.userPics
                : new Map([...newUserPics, ...prevState.userPics]),
              showBackdrop: false,
            };
          });
          // setPostState({ ...postState, showBackdrop: false });
          // setCurrentShow(shows[0]);
        });
    } else {
      axios
        .post("/api/posts", {
          headers: {
            "x-access-token": token,
          },
          post_text: newPostState.text,
          episode_air_date: newPostState.currentEpisode.air_date,
          episode_order: newPostState.currentEpisode.episodeOrder,
          tv_id: newPostState.currentShow.tv_id,
          type: "announcement",
          episode_number: newPostState.currentEpisode.episode_number,
          season_number: newPostState.currentEpisode.season_number,
          title: newPostState.currentShow.title,
        })
        .then((res) => {
          // console.log(res.data);
          const posts = res.data.posts;
          // console.log(posts);
          let newUserPics;
          const profilePicLoaded = newPostState.userPics.has(res.data.user_id);
          if (!profilePicLoaded) {
            newUserPics = new Map([[res.data.user_id, res.data.profile_pic]]);
          }
          // window.location.reload();
          // console.log(posts.concat(newPosts.posts));
          setNewPostState((prevState) => {
            // console.log(posts.concat(prevState.posts));
            return {
              ...prevState,
              posts: posts.concat(prevState.posts),
              userPics: profilePicLoaded
                ? prevState.userPics
                : new Map([...newUserPics, ...prevState.userPics]),
              showBackdrop: false,
            };
          });
          // setPostState({ ...postState, showBackdrop: false });
          // setCurrentShow(shows[0]);
        });
    }
  };

  const inputClickHandler = (event) => {
    // console.log(props);
    if (!loggedIn) {
      props.history.push("/login");
    } else {
      setNewPostState({ ...newPostState, showBackdrop: true });
    }
  };

  useEffect(() => {
    const subscriptionIDs =
      subscriptions && subscriptions.length > 0
        ? subscriptions.map((sub) => {
            return sub.show_id;
          })
        : null;
    if (subscriptions && subscriptions.length > 0) {
      axios
        .get("/api/shows", {
          headers: {
            "x-access-token": localStorage.getItem("token"),
          },
          params: {
            subscriptionIDs,
          },
          paramsSerializer: (params) => {
            return qs.stringify(params);
          },
        })
        .then((res) => {
          if (res.data.auth) {
            setNewPostState({
              ...newPostState,
              shows: res.data.shows,
              currentShow: res.data.shows[0],
              currentSeason: res.data.shows[0].episodes[0],
              currentEpisode: res.data.shows[0].episodes[0].episodes[0],
              show: String(res.data.shows[0].tv_id),
              season: String(res.data.shows[0].episodes[0].season_id),
              episode: String(
                res.data.shows[0].episodes[0].episodes[0].episode_id
              ),
            });
          } else {
            props.history.push("/login");
          }
        });
    }
    // eslint-disable-next-line
  }, [subscriptions]);

  useEffect(() => {
    const option = {
      root: null,
      rootMargin: "20px",
      threshold: 0,
    };
    const observer = new IntersectionObserver(handleObserver, option);
    if (loader.current) observer.observe(loader.current);
  }, [handleObserver]);

  return (
    <div className={classes.Feed}>
      {newPostState.showBackdrop && (
        <Backdrop showBackdrop={newPostState.showBackdrop}>
          <div className={classes.Modal} ref={ref}>
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
                {newPostState.shows.map((show) => {
                  // console.log("Show11");
                  return (
                    <option id={show.tv_id} value={show.tv_id}>
                      {show.title}
                    </option>
                  );
                })}
              </select>
              {newPostState.showDropdowns && newPostState.shows.length > 0 ? (
                <select className={classes.Dropdown} onChange={onSeasonSelect}>
                  {newPostState.currentShow.episodes.map((season) => {
                    return (
                      <option id={season.season_id} value={season.season_id}>
                        {season.season_name}
                      </option>
                    );
                  })}
                </select>
              ) : null}
              {newPostState.showDropdowns && newPostState.shows.length > 0 ? (
                <select className={classes.Dropdown} onChange={onEpisodeSelect}>
                  {newPostState.currentSeason.episodes.map((episode) => {
                    return (
                      <option
                        id={episode.episode_id}
                        value={episode.episode_id}
                      >
                        {episode.title}
                      </option>
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
      )}

      {loggedIn ? (
        <div className={classes.InputPost}>
          <img
            src={profilePic}
            className={classes.ProfilePic}
            alt="Profile"
          ></img>
          <input
            className={classes.InputPostInput}
            placeholder="Create a post..."
            onClick={inputClickHandler}
          ></input>
        </div>
      ) : null}
      <div>
        {newPostState.posts.map((post) => {
          return (
            <Post
              body={post.body}
              username={post.username}
              post_date={post.post_date.toString()}
              likes={post.likes}
              comments={post.comments}
              user_liked_post={post.user_liked_post}
              user_id={post.user_id}
              user_pic_map={newPostState.userPics}
              type={post.type}
              episode_tag={post.episode}
              tags={post.tags}
              post_id={post.post_id}
              friend_status={post.friend_status}
              num_likes={post.num_likes}
              delete_posts={deletePosts}
              key={post.post_id}
            ></Post>
          );
        })}
      </div>
      <div>
        {postList.map((post) => {
          return (
            <Post
              body={post.body}
              username={post.username}
              post_date={post.post_date.toString()}
              likes={post.likes}
              comments={post.comments}
              user_liked_post={post.user_liked_post}
              user_id={post.user_id}
              user_pic_map={userPicsMap}
              type={post.type}
              episode_tag={post.episode}
              tags={post.tags}
              post_id={post.post_id}
              friend_status={post.friend_status}
              num_likes={post.num_likes}
              delete_posts={deletePosts}
              key={post.post_id}
            ></Post>
          );
        })}
      </div>
      {loading && !done && <PostSpinner></PostSpinner>}
      {error && <p>Error!</p>}
      {done && (
        <div className={classes.EndMessageContainer}>
          <p className={classes.EndMessage}>
            No more posts for your subscribed shows!
          </p>
        </div>
      )}
      <div ref={loader} />
    </div>
  );
}

export default Feed;
