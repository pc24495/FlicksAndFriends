import React, { useState, useReducer, useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import ShowBox from "./ShowBox/ShowBox.js";
import LoadingShowBox from "./ShowBox/LoadingShowBox.js";
import classes from "./Subscriptions.module.css";
import axios from "../../axiosConfig.js";
import Axios from "axios";
import InfiniteScroll from "react-infinite-scroll-component";
import qs from "qs";

export default function Subscriptions(props) {
  const dispatch = useDispatch();
  const [state, setState] = useState({
    shows: [],
    displayShows: [],
    subscriptions: [],
    isSearching: false,
    filteredShows: [],
  });

  const searchValue = useSelector((state) => state.searchValue);
  let source = Axios.CancelToken.source();
  //Note: "show_id" field in shows corresponds to "tv_id" in subscriptions
  useEffect(async () => {
    if (state.shows.length === 0) {
      console.log("Querying backend");
      const token = localStorage.getItem("token");
      const SHOW_LIMIT = 6;
      const shows = await axios
        .get("/api/users/subscriptions-and-shows", {
          headers: {
            "x-access-token": token,
          },
          params: {
            limit: 12,
          },
        })
        .then((res) => {
          console.log(res.data.shows.length);
          setState({
            ...state,
            displayShows: res.data.displayShows,
            shows: res.data.shows,
            subscriptions: res.data.subscriptions,
          });
        });
    }
  }, []);

  useEffect(() => {
    source.cancel();
    source = Axios.CancelToken.source();
    console.log(searchValue);
    const token = localStorage.getItem("token");
    setTimeout(() => {
      if (
        searchValue &&
        searchValue.trim() !== null &&
        searchValue.trim() !== ""
      ) {
        console.log("not null");
        axios
          .get("/api/shows/", {
            headers: {
              "x-access-token": token,
            },
            cancelToken: source.token,
            params: {
              limit: 12,
              searchTerm: searchValue,
            },
          })
          .then((res) => {
            console.log(searchValue);
            setState({
              ...state,
              isSearching: true,
              filteredShows: res.data.shows,
            });
          });
      } else {
        console.log("null");
        console.log(state.filteredShows);
        setState({ ...state, isSearching: false, filteredShows: [] });
        console.log(state.isSearching);
      }
    }, 1);
  }, [searchValue]);

  const getMoreShows = async (event) => {
    const excludeIDs = state.shows.map((show) => show.show_id);
    const token = localStorage.getItem("token");
    await axios
      .get("/api/shows/", {
        headers: {
          "x-access-token": token,
        },
        params: {
          limit: 12,
          excludeIDs,
        },
      })
      .then((res) => {
        setState({
          ...state,
          shows: state.shows.concat(res.data.shows),
          displayShows: state.displayShows.concat(res.data.shows),
        });
      });
  };

  const removeSubscription = (event, tv_id) => {
    setState({
      ...state,
      subscriptions: state.subscriptions.filter((sub) => sub.show_id !== tv_id),
      displayShows: [
        state.shows.find((show) => parseInt(show.tv_id) === tv_id),
      ].concat(state.displayShows),
    });
  };

  const addSubscriptions = (event, tv_id) => {
    const subscription = JSON.parse(
      document.getElementById(tv_id).dataset.subscription
    );
    setState({
      ...state,
      subscriptions: [subscription].concat(state.subscriptions),
      displayShows: state.displayShows.filter(
        (show) => parseInt(show.tv_id) !== tv_id
      ),
    });
  };

  const submitSubscriptions = (event) => {
    let token = localStorage.getItem("token");
    // console.log(state.subscriptions);
    axios
      .patch("/api/users/subscriptions", {
        subscriptions: JSON.stringify(state.subscriptions),
        headers: {
          "x-access-token": token,
        },
      })
      .then((res) => {
        dispatch({
          type: "UPDATE_SUBSCRIPTIONS",
          subscriptions: state.subscriptions,
        });
        props.history.push("/");
      });
  };

  //   console.log(state.subscriptions);
  return (
    <div className={classes.Subscriptions}>
      {state.subscriptions ? (
        <div
          className={classes.ShowTags}
          style={{ display: state.subscriptions.length > 0 ? "block" : "none" }}
        >
          <div className={classes.ShowTagContainer}>
            {state.subscriptions.map((show) => (
              <p className={classes.ShowTag} key={show.show_title}>
                {show.show_title}
                <span
                  className={classes.CloseButton}
                  onClick={(event) => removeSubscription(event, show.show_id)}
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
      ) : null}
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
        {!state.isSearching ? (
          <InfiniteScroll
            dataLength={state.shows.length}
            className={classes.Selector}
            loader={<LoadingShowBox></LoadingShowBox>}
            hasMore={true}
            scrollThreshold={0}
            next={getMoreShows}
          >
            {state.displayShows.map((show, index) => (
              <ShowBox
                key={show.tv_id}
                id={show.tv_id}
                title={show.title}
                poster={show.poster}
                show={show}
                maxHeight={342}
                submitFunc={(event) => addSubscriptions(event, show.tv_id)}
              ></ShowBox>
            ))}
          </InfiniteScroll>
        ) : (
          <div className={classes.Selector}>
            {state.filteredShows.map((show, index) => (
              <ShowBox
                key={show.tv_id}
                id={show.tv_id}
                title={show.title}
                poster={show.poster}
                show={show}
                maxHeight={342}
                submitFunc={(event) => addSubscriptions(event, show.tv_id)}
              ></ShowBox>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
