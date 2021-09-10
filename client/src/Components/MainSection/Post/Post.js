import React, { useState, useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import classes from "./Post.module.css";
// import ClampLines from "react-clamp-lines";
import LinesEllipsis from "react-lines-ellipsis";
import HTMLEllipsis from "react-lines-ellipsis/lib/html";
import smile from "./smile.png";
import squareTest from "./SquareTestImage.png";
import { IoMdThumbsDown, IoMdThumbsUp } from "react-icons/io";
import { FaChevronCircleDown, FaArrowAltCircleRight } from "react-icons/fa";
import { BsThreeDotsVertical } from "react-icons/bs";
import { AiFillEdit, AiFillDelete } from "react-icons/ai";
import TextareaAutosize from "react-textarea-autosize";
import axios from "../../../axiosConfig.js";
// <p
//             style={{
//               margin: "10px",
//               fontWeight: "bold",
//               color: "var(--nord5)",
//               height: "20px",
//               lineHeight: "20px",
//               verticalAlign: "sub",
//             }}
//           >
//             \2022
//           </p>

export default function Post(props) {
  const [tags, setTags] = useState({
    display: false,

    tagList: [],
    friendStatus: null,
  });
  // console.log(tags.tagList[0].text);
  const postID = "57";
  const [showFullPost, setShowFullPost] = useState(false);
  // const [commentInputRows, setCommentInputRows] = useState(1);
  const [commentInputHeight, setCommentInputHeight] = useState("42px");
  const [showDropdown, setShowDropdown] = useState(false);
  const [showUserAdd, setShowUserAdd] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [comments, setComments] = useState([]);
  const [newComments, setNewComments] = useState([]);
  const textAreaRef = React.createRef();

  const friendsLikedIDs = useState([]);
  const [userLiked, setUserLiked] = useState(props.user_liked_post);
  const [body, setBody] = useState({
    bodyText: props.body,
    editMode: false,
    editText: props.body,
  });
  const profilePic = useSelector((state) => state.profilePic);
  const dropdownRef = useRef();
  const newFriendStatus = useSelector((state) => state.newFriendStatus);
  const dispatch = useDispatch();
  const [numLikes, setNumLikes] = useState(0);
  const userID = useSelector((state) => state.userID);

  const likes = [];

  useEffect(() => {
    // document
    //   .getElementById(`post_body-${props.post_id}`)
    //   .removeEventListener("keydown", postInputChange);
    // document
    //   .getElementById(`post_body-${props.post_id}`)
    //   .addEventListener("keydown", postInputChange);
    setTags({
      ...tags,
      tagList: props.tags.map((tag) => {
        return { ...tag, doesOverflow: false };
      }),
      friendStatus: props.friend_status,
    });
  }, [props]);

  useEffect(() => {
    // console.log(props.comments);
    if (props.comments) {
      setComments(props.comments);
    }
  }, [props.comments]);

  useEffect(() => {
    setBody({ ...body, bodyText: props.body, editText: props.body });
  }, [props.body]);

  useEffect(() => {
    if (parseInt(props.post_id) === 284) {
      console.log(props.num_likes);
      console.log(props.user_liked_post);
    }
    setNumLikes(props.num_likes);
  }, [props.num_likes]);

  const openTags = (event) => {
    setTags((prevState) => {
      return {
        ...prevState,
        display: !prevState.display,
      };
    });
  };

  const likesToText = (numLikes) => {
    if (numLikes < 1000) {
      return numLikes.toString();
    } else if (numLikes >= 1000 && numLikes < 1000000) {
      return (numLikes / 1000).toFixed(1) + "k";
    } else if (numLikes >= 1000000 && numLikes < 1000000000) {
      return (numLikes / 1000000).toFixed(1) + "m";
    }
  };

  const timeSince = (date) => {
    const seconds = Math.floor((new Date() - date) / 1000);

    let interval = seconds / 31536000;

    if (interval > 1) {
      return Math.floor(interval) === 1
        ? "1 year ago"
        : Math.floor(interval) + " years ago";
    }
    interval = seconds / 2592000;
    if (interval > 1) {
      return Math.floor(interval) === 1
        ? "1 month ago"
        : Math.floor(interval) + " months ago";
    }
    interval = seconds / 86400;
    if (interval > 1) {
      return Math.floor(interval) === 1
        ? "1 day ago"
        : Math.floor(interval) + " days ago";
    }
    interval = seconds / 3600;
    if (interval > 1) {
      return Math.floor(interval) === 1
        ? "1 hour ago"
        : Math.floor(interval) + " hours ago";
    }
    interval = seconds / 60;
    if (interval > 1) {
      return Math.floor(interval) === 1
        ? "1 minute ago"
        : Math.floor(interval) + " minutes ago";
    }
    interval = seconds;
    if (interval >= 1) {
      return Math.floor(interval) === 1
        ? "1 second ago"
        : Math.floor(interval) + " seconds ago";
    }
    return "Just now";
  };

  const showFull = (event) => {
    setShowFullPost(true);
  };

  const handleTextAreaOnChange = (event) => {
    setCommentText(event.target.value);
  };

  const dropdown = (event) => {
    if (showDropdown) {
      closeDropdown(event);
    } else {
      event.preventDefault();
      // console.log("Show dropdown");
      setTimeout(() => {
        document.addEventListener("click", closeDropdown);
      }, 20);

      setShowDropdown(true);
    }
  };

  const closeDropdown = (event) => {
    // console.log(event.target.className);
    const className = event.target.className.animVal || event.target.className;
    if (className.includes("Post_Edit")) {
      event.preventDefault();
      // console.log(event.target.className);
      setShowDropdown(false);
      setBody({ ...body, editMode: true });
      document.removeEventListener("click", closeDropdown);
    } else if (className.includes("Post_Delete")) {
      document.removeEventListener("click", closeDropdown);
      setShowDropdown(false);
      props.delete_posts(event, props.post_id);
    } else {
      event.preventDefault();
      // console.log(event.target.className);
      document.removeEventListener("click", closeDropdown);
      setShowDropdown(false);
    }
  };

  const hoverUsername = (event) => {
    setShowUserAdd(true);
  };

  const closeHoverUsername = (event) => {
    // console.log("closing");
    const element1 = document.getElementById(`${props.post_id}-username`);
    const element2 = document.getElementById(`${props.post_id}-useradd`);
    if (element2) {
      if (
        !element1.contains(event.target) &&
        !element2.contains(event.target)
      ) {
        document.removeEventListener("mouseover", closeHoverUsername);
        setShowUserAdd(false);
      }
    }
  };

  useEffect(() => {
    if (showUserAdd) {
      // console.log("User add displaying");
      document.addEventListener("mouseover", closeHoverUsername);
    }
  }, [showUserAdd]);

  const postInputChange = (event) => {
    // console.log(props.post_id);
    // console.log(event.keyCode);
    setBody({ ...body, editText: event.target.value });
  };

  const thumbsUpHandler = (event) => {
    // console.log("click");
    // console.log(props);
    // console.log(userID);
    // console.log(props.user_id);
    console.log(tags);
    const token = localStorage.getItem("token");
    if (userLiked === 1) {
      // console.log("Alreadyliked");
      axios.delete(`/api/posts/${props.post_id}/likes`, {
        headers: {
          "x-access-token": token,
        },
      });
      setUserLiked(0);
    } else {
      // console.log("not liked");
      axios.post(`/api/posts/${props.post_id}/likes`, {
        params: {
          type: "like",
        },
        headers: {
          "x-access-token": token,
        },
      });
      setUserLiked(1);
    }
  };
  const thumbsDownHandler = (event) => {
    const token = localStorage.getItem("token");
    if (userLiked === -1) {
      console.log("Alreadyliked");
      axios.delete(`/api/posts/${props.post_id}/likes`, {
        headers: {
          "x-access-token": token,
        },
      });
      setUserLiked(0);
    } else {
      // console.log("not liked");
      axios.post(`/api/posts/${props.post_id}/likes`, {
        params: {
          type: "dislike",
        },
        headers: {
          "x-access-token": token,
        },
      });
      setUserLiked(-1);
    }
  };
  // console.log(document.getElementById("57-0").getBoundingClientRect());

  const submitComment = (event) => {
    const token = localStorage.getItem("token");
    console.log(props);
    axios
      .post(`/api/comments/${props.post_id}`, {
        headers: {
          "x-access-token": localStorage.getItem("token"),
        },
        text: commentText,
      })
      .then((res) => {
        // console.log([]);
        setNewComments([...res.data.comments, ...newComments]);
      });
  };

  const friendRequestHandler = (event) => {
    console.log(tags.friendStatus);
    switch (tags.friendStatus) {
      case "Add Friend":
        axios
          .post(`/api/friend-requests/${props.user_id}`, {
            headers: {
              "x-access-token": localStorage.getItem("token"),
            },
          })
          .then((res) => {
            if (res.data.success) {
              dispatch({
                type: "NEW FRIEND STATUS",
                newFriendStatus: {
                  update: "Add Friend",
                  userID: props.user_id,
                },
              });
              setTags({ ...tags, friendStatus: "Unsend Friend Request" });
            }
          });
        break;
      case "Unsend Friend Request":
        axios
          .delete(`/api/friend-requests/${props.user_id}`, {
            headers: {
              "x-access-token": localStorage.getItem("token"),
            },
          })
          .then((res) => {
            if (res.data.success) {
              dispatch({
                type: "NEW FRIEND STATUS",
                newFriendStatus: {
                  update: "Unsend Friend Request",
                  userID: props.user_id,
                },
              });
              setTags({ ...tags, friendStatus: "Add Friend" });
            }
          });
        break;
      case "Accept Friend Request":
        axios
          .post(`/api/friends/${props.user_id}`, {
            headers: {
              "x-access-token": localStorage.getItem("token"),
            },
          })
          .then((res) => {
            if (res.data.success) {
              dispatch({
                type: "NEW FRIEND STATUS",
                newFriendStatus: {
                  update: "Accept Friend Request",
                  userID: props.user_id,
                  profilePic: props.user_pic_map.get(props.user_id),
                  username: props.username,
                },
              });
              setTags({ ...tags, friendStatus: "Unfriend User" });
            }
          });
        break;
      case "Unfriend User":
        axios
          .delete(`/api/friends/${props.user_id}`, {
            headers: {
              "x-access-token": localStorage.getItem("token"),
            },
          })
          .then((res) => {
            if (res.data.success) {
              dispatch({
                type: "NEW FRIEND STATUS",
                newFriendStatus: {
                  update: "Unfriend User",
                  userID: props.user_id,
                },
              });
              setTags({ ...tags, friendStatus: "Add Friend" });
            }
          });
        break;
    }
  };

  const saveEdit = (event) => {
    // console.log(body.editText);
    console.log(props.post_id);
    axios
      .patch(`/api/posts/${props.post_id}`, {
        headers: {
          "x-access-token": localStorage.getItem("token"),
        },
        post_text: body.editText,
      })
      .then((response) => console.log(response.data));
    setBody((prevBody) => {
      return {
        ...prevBody,
        bodyText: prevBody.editText,
        editText: prevBody.editText,
        editMode: false,
      };
    });
  };

  useEffect(() => {
    // console.log(newFriendStatus);
    // console.log(typeof props.user_id);
    // console.log(typeof newFriendStatus.userID);
    // console.log(Object.keys(newFriendStatus).length);
    if (
      Object.keys(newFriendStatus).length !== 0 &&
      String(newFriendStatus.userID) === props.user_id
    ) {
      switch (newFriendStatus.update) {
        case "Add Friend":
          setTags({ ...tags, friendStatus: "Unsend Friend Request" });
          break;
        case "Unsend Friend Request":
          setTags({ ...tags, friendStatus: "Add Friend" });
          break;
        case "Accept Friend Request":
          console.log("working correctly");
          setTags({ ...tags, friendStatus: "Unfriend User" });
          break;
        case "Unfriend User":
          setTags({ ...tags, friendStatus: "Add Friend" });
          break;
        case "Decline Friend Request":
          setTags({ ...tags, friendStatus: "Add Friend" });
          break;
      }
    }
  }, [newFriendStatus]);

  props.user_pic_map.get(props.user_id);
  const seeMore = "<i>...see more</i>";

  return (
    <div className={classes.PostContainer}>
      {showDropdown ? (
        <div className={classes.DropDown}>
          <div className={classes.Edit}>
            <div className={classes.EditInner}>
              <AiFillEdit></AiFillEdit> Edit
            </div>
          </div>
          <div className={classes.Delete}>
            <div className={classes.DeleteInner}>
              <AiFillDelete></AiFillDelete> Delete
            </div>
          </div>
        </div>
      ) : null}
      {showUserAdd && tags.friendStatus == "Add Friend" ? (
        <div className={classes.UserAdd} id={`${props.post_id}-useradd`}>
          <button
            className={classes.UserAddButton}
            onClick={friendRequestHandler}
          >
            Add Friend
          </button>
        </div>
      ) : null}
      {showUserAdd && tags.friendStatus == "Unsend Friend Request" ? (
        <div className={classes.UserAdd} id={`${props.post_id}-useradd`}>
          <button
            className={classes.UserAddButton}
            onClick={friendRequestHandler}
          >
            Unsend Friend Request
          </button>
        </div>
      ) : null}
      {showUserAdd && tags.friendStatus == "Accept Friend Request" ? (
        <div className={classes.UserAdd} id={`${props.post_id}-useradd`}>
          <button
            className={classes.UserAddButton}
            onClick={friendRequestHandler}
          >
            Accept Friend Request
          </button>
        </div>
      ) : null}
      {showUserAdd && tags.friendStatus == "Unfriend User" ? (
        <div className={classes.UserAdd} id={`${props.post_id}-useradd`}>
          <button
            className={classes.UserAddButton}
            onClick={friendRequestHandler}
          >
            Unfriend User
          </button>
        </div>
      ) : null}
      <div className={classes.Post}>
        <div className={classes.ProfilePicSection}>
          <img
            src={props.user_pic_map.get(props.user_id)}
            className={classes.ProfilePic}
            alt=""
          ></img>
        </div>
        <div className={classes.BodySection}>
          <div className={classes.Title}>
            <p
              className={classes.Username}
              onMouseEnter={hoverUsername}
              id={`${props.post_id}-username`}
            >
              {props.username}
            </p>
            <li className={classes.Bullet}>
              <ul></ul>
            </li>
            <p className={classes.Date}>
              {timeSince(Date.parse(props.post_date))}
            </p>
            {tags.friendStatus === "Unfriend User" ? (
              <li className={classes.FriendTagBullet}>
                <ul></ul>
              </li>
            ) : null}
            {tags.friendStatus === "Unfriend User" ? (
              <p className={classes.FriendTag}>Friend</p>
            ) : null}
            {userID === parseInt(props.user_id) ? (
              <BsThreeDotsVertical
                className={classes.ThreeDots}
                onClick={dropdown}
              ></BsThreeDotsVertical>
            ) : null}
          </div>

          <div className={classes.Tags} id={postID + "-tags"}>
            {tags.display
              ? tags.tagList.map((tag, index) => {
                  console.log(tag);
                  let backgroundColor;
                  if (tag.type === "type") {
                    backgroundColor = "var(--nord11)";
                  } else if (tag.type === "episode_tag") {
                    backgroundColor = "var(--nord13)";
                  } else if (tag.type === "title") {
                    backgroundColor = "var(--nord15)";
                  }
                  const id = [postID, "-", index.toString()].join("");
                  return (
                    <p
                      className={classes.Tag}
                      id={id}
                      style={{ backgroundColor: backgroundColor }}
                    >
                      {tag.text}
                    </p>
                  );
                })
              : tags.tagList
                  .filter((tag) => {
                    return !tag.doesOverflow && tag.text;
                  })
                  .map((tag, index) => {
                    // console.log(tag);
                    let backgroundColor;
                    if (tag.type === "type") {
                      if (tag.text === "Spoiler") {
                        backgroundColor = "var(--nord11)";
                      } else {
                        backgroundColor = "var(--nord12)";
                      }
                    } else if (tag.type === "episode_tag") {
                      backgroundColor = "var(--nord8)";
                    } else if (tag.type === "title") {
                      backgroundColor = "var(--nord15)";
                    }
                    const id = [postID, "-", index.toString()].join("");
                    return (
                      <p
                        className={classes.Tag}
                        id={id}
                        style={{ backgroundColor: backgroundColor }}
                      >
                        {tag.text}
                      </p>
                    );
                  })}
            {tags.length > 0 ? (
              <FaChevronCircleDown
                className={`${classes.DropTags} ${
                  tags.display ? classes.Rotate : ""
                }`}
                onClick={openTags}
              ></FaChevronCircleDown>
            ) : null}
          </div>

          <div className={classes.BodyOuter}>
            <div className={classes.module}>
              <TextareaAutosize
                className={classes.PostInput}
                style={{ display: body.editMode ? "block" : "none" }}
                id={`post_body-${props.post_id}`}
                onChange={postInputChange}
              >
                {body.bodyText}
              </TextareaAutosize>
              <button
                className={classes.Button}
                style={{ display: body.editMode ? "block" : "none" }}
                onClick={saveEdit}
              >
                Save
              </button>
              <HTMLEllipsis
                unsafeHTML={body.bodyText}
                maxLine={showFullPost ? "100" : "5"}
                basedOn="words"
                ellipsisHTML={seeMore}
                style={{ color: "var(--nord5)" }}
                className={classes.PostText}
                onClick={showFull}
                style={{ display: body.editMode ? "none" : "block" }}
              ></HTMLEllipsis>
            </div>
          </div>
          <div className={classes.Footer}>
            <div className={classes.FooterLeft}>
              <IoMdThumbsUp
                className={
                  userLiked === 1 ? classes.ThumbUpSelected : classes.ThumbUp
                }
                size={30}
                onClick={thumbsUpHandler}
              ></IoMdThumbsUp>
              {numLikes + userLiked != 0 ? (
                <p className={classes.NumLikes}>{numLikes + userLiked}</p>
              ) : null}
              <IoMdThumbsDown
                className={
                  userLiked === -1
                    ? classes.ThumbDownSelected
                    : classes.ThumbDown
                }
                size={30}
                onClick={thumbsDownHandler}
              ></IoMdThumbsDown>
            </div>
            <div className={classes.FooterCenter}>
              {likes.length === 0 ? null : (
                <div
                  style={{
                    position: "relative",
                    width: "40px",
                    height: "40px",
                    lineHeight: "40px",
                    backgroundColor: "yellow",
                    borderRadius: "50%",
                    fontSize: "15px",
                    textAlign: "center",
                    border: "3px solid white",
                    marginLeft: "-15px",
                  }}
                >
                  {"+" + likesToText(props.likes.length)}
                </div>
              )}
              <p
                style={{
                  fontSize: "10px",
                  marginLeft: "10px",
                  color: "var(--nord5)",
                }}
              >
                {likes.length === 0 ? null : "HHHHHHHHHHHHHHHHHHHH"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// <div className={classes.CommentSection}>
// <div className={classes.AddComment}>
//   <img
//     src={profilePic}
//     className={classes.FriendsLiked}
//     style={{
//       position: "relative",
//       width: "30px",
//       height: "30px",
//       padding: "10px",
//       top: "0px",
//       left: "0px",
//     }}
//     alt=""
//   ></img>
//   <TextareaAutosize
//     className={classes.CommentInput}
//     onChange={handleTextAreaOnChange}
//   ></TextareaAutosize>
//   <div className={classes.SubmitCommentContainer}>
//     <FaArrowAltCircleRight
//       className={classes.SubmitComment}
//       onClick={submitComment}
//     ></FaArrowAltCircleRight>
//   </div>
// </div>
// {newComments.map((comment) => (
//   <div className={classes.Comment}>
//     <div className={classes.CommentInner}>
//       <img
//         src={profilePic}
//         style={{
//           position: "relative",
//           width: "30px",
//           height: "30px",
//           padding: "10px",
//           top: "0px",
//           left: "0px",
//         }}
//         alt=""
//         className={classes.CommentProfilePic}
//       ></img>
//       <div className={classes.CommentText}>{comment.comment_body}</div>
//     </div>
//     <div className={classes.Options}>
//       <p className={classes.Option}>Like</p>
//       <p className={classes.Option}>Edit</p>
//       <p className={classes.Option}>Delete</p>
//     </div>
//   </div>
// ))}
// {comments.map((comment) => (
//   <div className={classes.Comment}>
//     <div className={classes.CommentInner}>
//       <img
//         src={profilePic}
//         style={{
//           position: "relative",
//           width: "30px",
//           height: "30px",
//           padding: "10px",
//           top: "0px",
//           left: "0px",
//         }}
//         alt=""
//         className={classes.CommentProfilePic}
//       ></img>
//       <div className={classes.CommentText}>{comment.comment_body}</div>
//     </div>
//     <div className={classes.Options}>
//       <p className={classes.Option}>Like</p>
//       <p className={classes.Option}>Edit</p>
//       <p className={classes.Option}>Delete</p>
//     </div>
//   </div>
// ))}
// </div>
