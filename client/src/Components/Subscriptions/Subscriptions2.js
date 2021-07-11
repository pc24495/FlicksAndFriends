import React, { useState, useReducer, useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import ShowBox from "./ShowBox/ShowBox.js";
import LoadingShowBox from "./ShowBox/LoadingShowBox.js";
import classes from "./Subscriptions.module.css";
import axios from "../../axiosConfig.js";
import InfiniteScroll from "react-infinite-scroll-component";
import qs from "qs";

export default function Subscriptions(props) {
  const [state, setState] = useState({
    shows: [],
    displayShows: [],
    subscriptions: [],
    isSearching: false,
    loadedShows: [],
  });

  const searchValue = useSelector((state) => state.searchValue);

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
    // console.log(searchValue);
  }, [searchValue]);

  //   const getMoreShows = (event) => {

  //   }

  //   console.log(state);
  return (
    <div className={classes.Subscriptions}>
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
        <InfiniteScroll
          dataLength={state.shows.length}
          className={classes.Selector}
          loader={<LoadingShowBox></LoadingShowBox>}
          hasMore={true}
          scrollThreshold={0}
        >
          {state.displayShows.map((show, index) => (
            <ShowBox
              key={show.tv_id}
              id={show.tv_id}
              title={show.title}
              poster={show.poster}
              show={show}
              maxHeight={342}
              submitFunc={(event) => console.log(event)}
            ></ShowBox>
          ))}
        </InfiniteScroll>
      </div>
    </div>
  );
}
