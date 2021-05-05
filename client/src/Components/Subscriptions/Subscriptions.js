import React, { useState, useReducer, useEffect } from "react";
import { useSelector } from "react-redux";
import ShowBox from "./ShowBox/ShowBox.js";
import classes from "./Subscriptions.module.css";

const ACTIONS = {
  SELECT_SHOW: "select show",
  UNSELECT_SHOW: "unselect show",
  SET_INIT: "set init",
};

export default function Subscriptions(props) {
  let shows = useSelector((state) => {
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
    switch (action.TYPE) {
      case ACTIONS.SELECT_SHOW:
        const selectedID = action.selectedID;
        let selectedShows = [...state.displayList];
        let displayShows = [...state.selectedShows];
        selectedShows = selectedShows.map((show) => {
          if (show.show_id === selectedID) {
            displayShows.push(show);
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
      case ACTIONS.UNSELECT_SHOW:
        return state;
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
    dispatch({
      type: "set init",
      displayList: displayList,
      selectedList: selectedList,
    });
    // console.log(displayList);
    // console.log("Refreshing state");
  }, [[], shows]);

  const maxHeight = shows.reduce((acc, curr) => {
    if (curr.poster_height > acc) {
      return curr.poster_height;
    } else {
      return acc;
    }
  }, 0);

  const addSubscription = (event, tv_id) => {
    dispatch({ type: "select show", selectedID: tv_id });
  };

  console.log(state.displayList);

  return state.displayList.length > 0 ? (
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
      <div className={classes.ShowTags}>
        {state.selectedList.map((show) => (
          <p key={show.title}>{show.title}</p>
        ))}
      </div>
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
              submitFunc={(event) => addSubscription(event, show.tv_id)}
            ></ShowBox>
          ))}
      </div>
    </div>
  ) : (
    <p>Loading</p>
  );
}
