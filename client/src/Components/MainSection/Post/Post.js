import React, { useState, useEffect } from "react";
import classes from "./Post.module.css";
// import ClampLines from "react-clamp-lines";
import LinesEllipsis from "react-lines-ellipsis";
import HTMLEllipsis from "react-lines-ellipsis/lib/html";
import smile from "./smile.png";
import squareTest from "./SquareTestImage.png";
import { IoMdThumbsDown, IoMdThumbsUp } from "react-icons/io";
import { FaChevronCircleDown } from "react-icons/fa";
import TextareaAutosize from "react-textarea-autosize";
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
    tagList: [
      { text: "ShadowAndBone", doesOverflow: false },
      { text: "TestingTag", doesOverflow: false },
      { text: "TestingTag2", doesOverflow: false },
      { text: "TestingTag9", doesOverflow: false },
      { text: "TestingTag123", doesOverflow: false },
    ],
  });
  const postID = "57";
  const [showFullPost, setShowFullPost] = useState(false);
  // const [commentInputRows, setCommentInputRows] = useState(1);
  const [commentInputHeight, setCommentInputHeight] = useState("42px");
  const textAreaRef = React.createRef();

  useEffect(() => {
    let newTags = tags.tagList;
    let tagsWidth = 26; //should be width of downArrow actually
    let isOverflowing = false;
    const tagContainerWidth = Math.ceil(
      document.getElementById(postID + "-tags").getBoundingClientRect().width
    );
    newTags = newTags.map((tag, index) => {
      const width = Math.ceil(
        document
          .getElementById(postID + "-" + index.toString())
          .getBoundingClientRect().width
      );
      if (!isOverflowing) {
        tagsWidth += width + 3;
        if (tagsWidth > tagContainerWidth) {
          isOverflowing = true;
          return {
            ...tag,
            doesOverflow: true,
          };
        } else {
          return {
            ...tag,
            doesOverflow: false,
          };
        }
      } else {
        return {
          ...tag,
          doesOverflow: true,
        };
      }
    });
    setTags({ ...tags, tagList: newTags });
  }, []);

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
    console.log(event.target.value);
  };

  // console.log(document.getElementById("57-0").getBoundingClientRect());

  const stringToTest = props.body;
  // const toggleTags = () => {
  //   if (tagDisplay) {
  //   } else {
  //   }
  // };

  const HTMLToTest = <p>{props.body}</p>;

  const seeMore = "<i>...see more</i>";
  // timeSince(props.post_date)
  return (
    <div className={classes.PostContainer}>
      <div className={classes.Post}>
        <div className={classes.ProfilePicSection}>
          <img src={squareTest} className={classes.ProfilePic} alt=""></img>
        </div>
        <div className={classes.BodySection}>
          <div className={classes.Title}>
            <p className={classes.Username}>{props.username}</p>
            <li className={classes.Bullet}>
              <ul></ul>
            </li>
            <p className={classes.Date}>
              {timeSince(Date.parse(props.post_date))}
            </p>
          </div>

          <div className={classes.Tags} id={postID + "-tags"}>
            {tags.display
              ? tags.tagList.map((tag, index) => {
                  const id = [postID, "-", index.toString()].join("");
                  return (
                    <p className={classes.Tag} id={id}>
                      {tag.text}
                    </p>
                  );
                })
              : tags.tagList
                  .filter((tag) => !tag.doesOverflow)
                  .map((tag, index) => {
                    const id = [postID, "-", index.toString()].join("");
                    return (
                      <p className={classes.Tag} id={id}>
                        {tag.text}
                      </p>
                    );
                  })}
            <FaChevronCircleDown
              className={`${classes.DropTags} ${
                tags.display ? classes.Rotate : ""
              }`}
              onClick={openTags}
            ></FaChevronCircleDown>
          </div>

          <div className={classes.BodyOuter}>
            <div className={classes.module}>
              <HTMLEllipsis
                unsafeHTML={stringToTest}
                maxLine={showFullPost ? "100" : "5"}
                basedOn="words"
                ellipsisHTML={seeMore}
                style={{ color: "var(--nord5)" }}
                className={classes.PostText}
                onClick={showFull}
              ></HTMLEllipsis>
            </div>
          </div>
          <div className={classes.Footer}>
            <div className={classes.FooterLeft}>
              <IoMdThumbsUp
                className={classes.ThumbUp}
                size={30}
              ></IoMdThumbsUp>
              <IoMdThumbsDown
                className={classes.ThumbDown}
                size={30}
              ></IoMdThumbsDown>
            </div>
            <div className={classes.FooterCenter}>
              <img
                src={smile}
                className={classes.FriendsLiked}
                style={{
                  position: "relative",
                  width: "40px",
                  boxSizing: "content-box",
                  borderRadius: "50%",
                  border: "3px solid white",
                }}
                alt=""
              ></img>
              <img
                src={smile}
                className={classes.FriendsLiked}
                style={{
                  position: "relative",
                  width: "40px",
                  boxSizing: "content-box",
                  borderRadius: "50%",
                  border: "3px solid white",
                }}
                alt=""
              ></img>
              <img
                src={smile}
                className={classes.FriendsLiked}
                style={{
                  position: "relative",
                  width: "40px",
                  boxSizing: "content-box",
                  borderRadius: "50%",
                  border: "3px solid white",
                }}
                alt=""
              ></img>
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
              <p
                style={{
                  fontSize: "10px",
                  marginLeft: "10px",
                  color: "var(--nord5)",
                }}
              >
                HHHHHHHHHHHHHHHHHHHH
              </p>
            </div>
          </div>
        </div>
      </div>
      <div className={classes.CommentSection}>
        <div className={classes.AddComment}>
          <img
            src={smile}
            className={classes.FriendsLiked}
            style={{
              position: "relative",
              width: "30px",
              height: "30px",
              padding: "10px",
              top: "0px",
              left: "0px",
            }}
            alt=""
          ></img>
          <TextareaAutosize
            className={classes.CommentInput}
            onChange={handleTextAreaOnChange}
          ></TextareaAutosize>
        </div>
        {props.comments.map((comment) => (
          <div className={classes.Comment}>
            <div className={classes.CommentInner}>
              <img
                src={smile}
                style={{
                  position: "relative",
                  width: "30px",
                  height: "30px",
                  padding: "10px",
                  top: "0px",
                  left: "0px",
                }}
                alt=""
              ></img>
              <div className={classes.CommentText}>{comment.commentBody}</div>
            </div>
            <div className={classes.Options}>
              <p className={classes.Option}>Like</p>
              <p className={classes.Option}>Edit</p>
              <p className={classes.Option}>Delete</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// <div className={classes.Options}>
//             <p className={classes.Option}>Like</p>
//             <p className={classes.Option}>Edit</p>
//             <p className={classes.Option}>Delete</p>
//           </div>
