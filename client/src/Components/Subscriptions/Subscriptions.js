import React, { useState, useReducer, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import ShowBox from "./ShowBox/ShowBox.js";
import classes from "./Subscriptions.module.css";
import Button from "../Button/Button.js";
import axios from "axios";

export default function Subscriptions(props) {
  const dispatchRedux = useDispatch();
  const ACTIONS = {
    SELECT_SHOW: "select show",
    UNSELECT_SHOW: "unselect show",
    SET_INIT: "set init",
    MERGE_SUBSCRIPTIONS: "merge subscriptions",
  };

  let shows = useSelector((state) => {
    // console.log(state.shows);
    // console.log(state.shows);
    return state.shows;
  });
  let subscriptionsList = useSelector((state) => {
    // console.log(state.subscriptions);
    return state.subscriptions;
  });
  //   console.log(shows);
  let subscriptions = null;
  if (localStorage.getItem("subscriptions")) {
    subscriptions = JSON.parse(localStorage.getItem("subscriptions"));
    // console.log(subscriptions);
    // console.log(localStorage.getItem("subscriptions"));
    // console.log(typeof subscriptions);
  } else {
    subscriptions = subscriptionsList;
    // console.log(subscriptions);
  }
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
    subscriptions: subscriptions,
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
        let subscriptions = [...state.subscriptions];
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
        subscriptions.push(action.subscription);
        return {
          ...state,
          displayList: displayShows,
          selectedList: selectedShows,
          subscriptions: subscriptions,
        };
      }
      case ACTIONS.UNSELECT_SHOW: {
        const unSelectedID = action.selectedID;
        let selectedShows = [...state.selectedList];
        let displayShows = [...state.displayList];
        let subscriptions = [...state.subscriptions];
        selectedShows = selectedShows.filter((show) => {
          //   console.log("show: " + show.tv_id + " selected: " + unSelectedID);
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
        subscriptions = subscriptions.filter((show) => {
          return show.show_id != unSelectedID;
        });
        return {
          ...state,
          displayList: displayShows,
          selectedList: selectedShows,
          subscriptions: subscriptions,
        };
      }
      case ACTIONS.SET_INIT:
        // console.log("Dispatch set init");
        return {
          ...state,
          displayList: action.displayList,
          selectedList: action.selctedList,
        };
      case ACTIONS.MERGE_SUBSCRIPTIONS: {
        let subscriptionList = action.subscriptions;
        // console.log(subscriptionList);
        if (subscriptionList.length === undefined) {
          subscriptionList = [];
        }
        // console.log(subscriptionList.length);
        if (subscriptionList.length === 0) {
          return {
            ...state,
          };
        }
        // console.log(subscriptionList);
        const subscriptionIDs = subscriptionList.map((show) => show.show_id);
        // console.log(subscriptionIDs);
        let selectedShows = state.selectedList;
        const selectedIDs = selectedShows.map((show) => show.tv_id);
        let displayShows = state.displayList;
        // console.log(selectedShows);
        displayShows = displayShows.map((show) => {
          if (subscriptionIDs.includes(show.tv_id)) {
            if (!selectedIDs.includes(show.tv_id)) {
              selectedShows.push(show);
            }
            return {
              ...show,
              display: false,
            };
          } else {
            return show;
          }
        });
        return {
          ...state,
          displayList: displayShows,
          selectedList: selectedShows,
          subscriptions: subscriptionList,
        };
      }
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
    // console.log(shows);
    localStorage.setItem("shows", JSON.stringify(shows));
    // console.log(displayList);
    // console.log("Refreshing state");
  }, [state.displayList, shows]);

  useEffect(() => {
    // console.log(typeof subscriptionsList);
    localStorage.setItem("subscriptions", JSON.stringify(subscriptionsList));
    // console.log(JSON.parse(subscriptionsList));
    dispatch({
      type: ACTIONS.MERGE_SUBSCRIPTIONS,
      subscriptions: subscriptionsList,
    });

    // console.log(displayList);
    // console.log("Refreshing state");
  }, [subscriptionsList]);

  const maxHeight = shows.reduce((acc, curr) => {
    if (curr.poster_height > acc) {
      return curr.poster_height;
    } else {
      return acc;
    }
  }, 0);

  const addSubscription = (event, tv_id, dispatch) => {
    const subscription = JSON.parse(
      document.getElementById(tv_id).dataset.subscription
    );
    console.log(subscription);
    // console.log(subscription);
    // console.log("Clicked");
    dispatch({
      type: ACTIONS.SELECT_SHOW,
      selectedID: tv_id,
      subscription: subscription,
    });
  };

  const removeSubscription = (event, tv_id, dispatch) => {
    dispatch({ type: ACTIONS.UNSELECT_SHOW, selectedID: tv_id });
  };

  const submitSubscriptions = (event) => {
    let token = localStorage.getItem("token");
    // console.log(state.subscriptions);
    axios
      .post("http://localhost:3000/api/updateSubscriptions", {
        subscriptions: JSON.stringify(state.subscriptions),
        headers: {
          "x-access-token": token,
        },
      })
      .then((res) => {
        dispatchRedux({
          type: "UPDATE_SUBSCRIPTIONS",
          subscriptions: state.subscriptions,
        });
        props.history.push("/");
      });
  };

  // console.log(state);

  return state.displayList.length > 0 ? (
    <div className={classes.Subscriptions}>
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
          <button
            onClick={(event) => submitSubscriptions(event)}
            className={classes.Button}
          >
            Submit
          </button>
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
