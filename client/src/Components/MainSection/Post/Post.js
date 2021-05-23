import React, { useState, useEffect } from "react";
import classes from "./Post.module.css";
// import ClampLines from "react-clamp-lines";
import LinesEllipsis from "react-lines-ellipsis";
import HTMLEllipsis from "react-lines-ellipsis/lib/html";
import smile from "./smile.png";
import { IoMdThumbsDown, IoMdThumbsUp } from "react-icons/io";
import { FaChevronCircleDown } from "react-icons/fa";

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

  useEffect(() => {
    let newTags = tags.tagList;
    let tagsWidth = 0; //should be width of downArrow actually
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

  const showFull = (event) => {
    setShowFullPost(true);
  };

  // console.log(document.getElementById("57-0").getBoundingClientRect());

  const stringToTest =
    "Lorem ipsum dolor, sit amet consectetur adipisicing elit.  Quidem inventore aut dicta non eaque dolorem iste quis praesentium, ipsa suscipit? Nihil quibusdam amet rerum possimus mollitia tempore, eligendi rem deserunt ea labore maxime qui officia totam pariatur veniam voluptates aliquam aliquid. Cum magnam animi cupiditate et quidem eum hic veniam? s";

  // const toggleTags = () => {
  //   if (tagDisplay) {
  //   } else {
  //   }
  // };

  const HTMLToTest = (
    <p>
      Lorem ipsum dolor, sit amet consectetur adipisicing elit. Quidem inventore
      aut dicta non eaque dolorem iste quis praesentium, ipsa suscipit? Nihil
      quibusdam amet rerum possimus mollitia tempore, eligendi rem deserunt ea
      labore maxime qui officia totam pariatur veniam voluptates aliquam
      aliquid. Cum magnam animi cupiditate et quidem eum hic veniam? s
    </p>
  );

  const seeMore = "<i>...see more</i>";

  return (
    <div className={classes.PostContainer}>
      <div className={classes.Post}>
        <div className={classes.ProfilePicSection}>
          <img src={smile} className={classes.ProfilePic} alt=""></img>
        </div>
        <div className={classes.BodySection}>
          <div className={classes.Title}>
            <p className={classes.Username}>JohnSmith</p>
            <li className={classes.Bullet}>
              <ul></ul>
            </li>
            <p className={classes.Date}> 2 days ago</p>
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
              <IoMdThumbsUp className={classes.Thumb} size={30}></IoMdThumbsUp>
              <IoMdThumbsDown
                className={classes.Thumb}
                size={30}
              ></IoMdThumbsDown>
            </div>
            <div className={classes.FooterCenter}>
              <img
                src={smile}
                className={classes.FriendsLiked}
                style={{
                  position: "relative",
                  width: "30px",
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
                  width: "30px",

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
                  width: "30px",
                  boxSizing: "content-box",
                  borderRadius: "50%",
                  border: "3px solid white",
                }}
                alt=""
              ></img>
              <div
                style={{
                  position: "relative",
                  width: "30px",
                  height: "30px",
                  lineHeight: "30px",
                  backgroundColor: "yellow",
                  borderRadius: "50%",
                  fontSize: "12px",
                  textAlign: "center",
                  border: "3px solid white",
                  marginLeft: "-15px",
                }}
              >
                4.5k
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
          <input className={classes.CommentInput}></input>
        </div>
        <div className={classes.Comment}>
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
          <div className={classes.CommentText}>
            orem ipsum dolor, sit amet consectetur adipisicing elit. Quidem
            inventore aut dicta non eaque dolorem iste quis praesentium, ipsa
            suscipit? Nihil quibusdam amet rerum possimus mollitia tempore,
            eligendi rem deserunt ea labore maxime qui officia totam pariatur
            veniam voluptates aliquam aliquid. Cum magnam animi cupiditate et
            quidem eum hic v
          </div>
        </div>
      </div>
    </div>
  );
}
