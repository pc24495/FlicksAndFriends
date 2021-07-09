import React, { useState, useReducer, useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import ShowBox from "./ShowBox/ShowBox.js";
import classes from "./Subscriptions.module.css";
import axios from "../../axiosConfig.js";
import InfiniteScroll from "react-infinite-scroll-component";

export default function Subscriptions(props) {
  const [state, setState] = useState({
    shows: [],
    displayShows: [],
    subscriptions: [],
    posterMap: new Map([]),
    isSearching: false,
    loadedShows: [],
  });

  const searchValue = useSelector((state) => state.searchValue);

  //Note: "show_id" field in shows corresponds to "tv_id" in subscriptions
  useEffect(() => {
    if (state.shows.length === 0) {
      console.log("Querying backend");
      const token = localStorage.getItem("token");
      axios
        .post("/api/getSubscriptionsAndShows", {
          headers: {
            "x-access-token": token,
          },
        })
        .then((res) => {
          console.log(res.data.subscriptions);
          console.log(res.data.shows);
        });
    }
  }, []);

  useEffect(() => {
    console.log(searchValue);
  }, [searchValue]);

  return <div className={classes.Subscriptions}></div>;
}
