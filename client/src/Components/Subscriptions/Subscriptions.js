import React, { useState, useReducer, useEffect } from "react";
import { useSelector } from "react-redux";
import ShowBox from "./ShowBox/ShowBox.js";
import classes from "./Subscriptions.module.css";
import Button from "../Button/Button.js";

export default function Subscriptions(props) {
  const ACTIONS = {
    SELECT_SHOW: "select show",
    UNSELECT_SHOW: "unselect show",
    SET_INIT: "set init",
  };

  let shows = useSelector((state) => {
    // console.log(state.shows);
    console.log(state.shows);
    return state.shows;
  });
  //   console.log(shows);

  let posterMap = new Map();
  shows.forEach((show) => posterMap.set(show.tv_id, show.poster));

  let selectedList = [];
  let displayList =
    JSON.parse(localStorage.getItem("shows")) ||
    shows.map((show) => {
      return { ...show, poster: null, display: true };
    });
  displayList = displayList.map((show) => {
    return { ...show, display: true };
  });
  //   console.log(displayList);
  //   console.log(localStorage.getItem("shows"));
  let initState = {
    displayList: displayList,
    selectedList: selectedList,
  };

  //   console.log(initState);

  const reducer = (state = initState, action) => {
    switch (action.type) {
      case ACTIONS.SELECT_SHOW: {
        // console.log("adding subscription");
        const selectedID = action.selectedID;
        // console.log(selectedID);
        let selectedShows = [...state.selectedList];
        let displayShows = [...state.displayList];
        displayShows = displayShows.map((show) => {
          //   console.log(show.tv_id);
          if (show.tv_id === selectedID) {
            selectedShows.push(show);
            return {
              ...show,
              display: false,
            };
          } else {
            return show;
          }
        });
        return {
          displayList: displayShows,
          selectedList: selectedShows,
        };
      }
      case ACTIONS.UNSELECT_SHOW: {
        const unSelectedID = action.selectedID;
        let selectedShows = [...state.selectedList];
        let displayShows = [...state.displayList];
        selectedShows = selectedShows.filter((show) => {
          console.log("show: " + show.tv_id + " selected: " + unSelectedID);
          return show.tv_id != unSelectedID;
        });
        displayShows = displayShows.map((show) => {
          if (show.tv_id === unSelectedID) {
            return {
              ...show,
              display: true,
            };
          } else {
            return show;
          }
        });
        return {
          displayList: displayShows,
          selectedList: selectedShows,
        };
      }
      case ACTIONS.SET_INIT:
        // console.log("Dispatch set init");
        return {
          displayList: action.displayList,
          selctedList: action.selctedList,
        };
      default:
        return state;
    }
  };
  //   const [selectedShows, setSelectedShows] = useState(selectedList);
  //   const [displayShows, set] = useState(displayList);

  //   const [, set] = useState(initialState);
  const [state, dispatch] = useReducer(reducer, initState);

  //   console.log(displayList);

  //   console.log(state);

  useEffect(() => {
    localStorage.setItem("shows", JSON.stringify(shows));
    // console.log(displayList);
    // console.log("Refreshing state");
  }, [state.displayList, shows]);

  const maxHeight = shows.reduce((acc, curr) => {
    if (curr.poster_height > acc) {
      return curr.poster_height;
    } else {
      return acc;
    }
  }, 0);

  const addSubscription = (event, tv_id, dispatch) => {
    // console.log("Clicked");
    dispatch({ type: ACTIONS.SELECT_SHOW, selectedID: tv_id });
  };

  const removeSubscription = (event, tv_id, dispatch) => {
    dispatch({ type: ACTIONS.UNSELECT_SHOW, selectedID: tv_id });
  };

  console.log(state);

  return state.displayList.length > 0 ? (
    <div>
      <div
        className={classes.ShowTags}
        style={{ display: state.selectedList.length > 0 ? "block" : "none" }}
      >
        <div className={classes.ShowTagContainer}>
          {state.selectedList.map((show) => (
            <p className={classes.ShowTag} key={show.title}>
              {show.title}
              <span
                className={classes.CloseButton}
                onClick={(event) =>
                  removeSubscription(event, show.tv_id, dispatch)
                }
              >
                {" "}
                x
              </span>
            </p>
          ))}
        </div>
        <br></br>
        <div className={classes.ButtonContainer}>
          <button className={classes.Button}>Submit</button>
        </div>
      </div>
      <div
        style={{
          margin: "auto",
          position: "relative",
          width: "90%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
        }}
      >
        <div className={classes.Selector}>
          {state.displayList
            .filter((show) => show.display)
            .map((show, index) => (
              <ShowBox
                key={show.tv_id}
                id={show.tv_id}
                title={show.title}
                poster={posterMap.get(show.tv_id)}
                show={show}
                maxHeight={maxHeight}
                submitFunc={(event) =>
                  addSubscription(event, show.tv_id, dispatch)
                }
              ></ShowBox>
            ))}
        </div>
      </div>
    </div>
  ) : (
    <p>Loading</p>
  );
}
