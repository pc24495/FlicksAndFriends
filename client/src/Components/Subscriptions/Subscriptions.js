import React, { useState, useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import ShowBox from "./ShowBox/ShowBox.js";
import LoadingShowBox from "./ShowBox/LoadingShowBox.js";
import Backdrop from "../Backdrop/Backdrop.js";
import classes from "./Subscriptions.module.css";
import axios from "../../axiosConfig.js";
import Axios from "axios";
import InfiniteScroll from "react-infinite-scroll-component";
import qs from "qs";
import { BsCaretUpFill } from "react-icons/bs";
import { BsSearch } from "react-icons/bs";
import { AiOutlineClose } from "react-icons/ai";
import useMediaQuery from "@mui/material/useMediaQuery";

export default function Subscriptions(props) {
  const dispatch = useDispatch();
  const [state, setState] = useState({
    shows: [],
    displayShows: [],
    subscriptions: [],
    isSearching: false,
    filteredShows: [],
    showBackdrop: false,
    clickedShow: {},
    searchMode: false,
  });
  const [expandTags, setExpandTags] = useState(false);
  const searchValue = useSelector((state) => state.searchValue);
  let source = Axios.CancelToken.source();
  const mobileCutoff = useMediaQuery("(max-width:610px)");
  const mobileShowboxRef = useRef();
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
            paramsSerializer: (params) => {
              return qs.stringify(params);
            },
          })
          .then((res) => {
            console.log(state.filteredShows);
            console.log(res.data.shows);
            console.log(searchValue);
            const newFilteredShows = res.data.shows;
            setState((prevState) => {
              return {
                ...prevState,
                isSearching: true,
                filteredShows: newFilteredShows,
              };
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
    // console.log(state.shows);
    const excludeIDs = state.shows.map((show) => show.show_id);
    // console.log(excludeIDs);
    const token = localStorage.getItem("token");
    setTimeout(async () => {
      await axios
        .get("/api/shows/", {
          headers: {
            "x-access-token": token,
          },
          params: {
            limit: 12,
            excludeIDs,
          },
          paramsSerializer: (params) => {
            // console.log(qs.stringify(params));
            return qs.stringify(params);
          },
        })
        .then((res) => {
          setState({
            ...state,
            shows: state.shows.concat(res.data.shows),
            displayShows: state.displayShows.concat(res.data.shows),
          });
        });
    }, 1000);
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

  const handleBackdropShowBox = (event, tv_id) => {
    const subscription = JSON.parse(
      document.getElementById(tv_id + "-mobile").dataset.subscription
    );
    setState({
      ...state,
      subscriptions: [subscription].concat(state.subscriptions),
      displayShows: state.displayShows.filter(
        (show) => parseInt(show.tv_id) !== tv_id
      ),
      showBackdrop: false,
      clickedShow: {},
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

  const handleMobileShowClick = (show) => {
    setState({ ...state, clickedShow: show, showBackdrop: true });
  };

  const handleBackdropClick = (event) => {
    if (!mobileShowboxRef.current.contains(event.target)) {
      setState({ ...state, showBackdrop: false, clickedShow: {} });
    }
  };

  const handleMobileSearch = (event) => {
    dispatch({ type: "SEARCH", searchValue: event.target.value });
  };
  //   console.log(state.subscriptions);
  return (
    <div className={classes.Subscriptions}>
      <div className={classes.FixedElements}>
        {state.subscriptions ? (
          <div
            className={classes.ShowTags}
            style={{
              display: state.subscriptions.length > 0 ? "block" : "none",
            }}
          >
            <div
              className={classes.ShowTagContainer}
              style={{ height: expandTags ? "fit-content" : "35px" }}
            >
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
              <BsCaretUpFill
                className={classes.BsCaretUpFill}
                style={{
                  transform: !expandTags ? "rotate(180deg)" : "rotate(0deg)",
                }}
                onClick={() =>
                  setExpandTags((prevExpandTags) => !prevExpandTags)
                }
              ></BsCaretUpFill>
              <button
                onClick={(event) => submitSubscriptions(event)}
                className={classes.Button}
              >
                Submit
              </button>
            </div>
          </div>
        ) : null}
        {state.searchMode && mobileCutoff ? (
          <div className={classes.MobileSearch}>
            <div className={classes.MobileSearchInner}>
              <div className={classes.MobileSearchInnerInner}>
                <BsSearch className={classes.SearchBarIcon}></BsSearch>
                <div className={classes.MobileSearchbar}>
                  <input onChange={handleMobileSearch}></input>
                </div>
              </div>
              <AiOutlineClose
                className={classes.CloseSearch}
                onClick={() => setState({ ...state, searchMode: false })}
              >
                x
              </AiOutlineClose>
            </div>
          </div>
        ) : null}
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
        {!mobileCutoff && !state.isSearching ? (
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
                key={`${show.tv_id}`}
                id={show.tv_id}
                title={show.title}
                poster={show.poster}
                show={show}
                maxHeight={342}
                submitFunc={(event) => addSubscriptions(event, show.tv_id)}
              ></ShowBox>
            ))}
          </InfiniteScroll>
        ) : null}
        {!mobileCutoff && state.isSearching ? (
          <div className={classes.Selector}>
            {state.filteredShows.map((show, index) => (
              <ShowBox
                key={`${show.tv_id}`}
                id={show.tv_id}
                title={show.title}
                poster={show.poster}
                show={show}
                maxHeight={342}
                submitFunc={(event) => addSubscriptions(event, show.tv_id)}
              ></ShowBox>
            ))}
          </div>
        ) : null}
        {mobileCutoff && !state.isSearching ? (
          <InfiniteScroll
            dataLength={state.shows.length}
            className={classes.SelectorMobile}
            loader={<LoadingShowBox></LoadingShowBox>}
            hasMore={true}
            scrollThreshold={0}
            next={getMoreShows}
          >
            {state.displayShows.map((show, index) => (
              <div className={classes.ShowTitleBox}>
                <p onClick={() => handleMobileShowClick(show)}>{show.title}</p>
              </div>
            ))}
          </InfiniteScroll>
        ) : null}
        {mobileCutoff && state.isSearching ? (
          <InfiniteScroll
            dataLength={state.shows.length}
            className={classes.SelectorMobile}
            loader={<LoadingShowBox></LoadingShowBox>}
            hasMore={true}
            scrollThreshold={0}
            next={getMoreShows}
          >
            {state.filteredShows.map((show, index) => (
              <div className={classes.ShowTitleBox}>
                <p onClick={() => handleMobileShowClick(show)}>{show.title}</p>
              </div>
            ))}
          </InfiniteScroll>
        ) : null}
      </div>
      {!state.searchMode ? (
        <div
          className={classes.SearchIconContainer}
          onClick={() => {
            dispatch({ type: "SEARCH", searchValue: "" });
            setState({ ...state, searchMode: true });
          }}
        >
          <BsSearch className={classes.SearchIcon}></BsSearch>
        </div>
      ) : null}

      <Backdrop showBackdrop={state.showBackdrop} onClick={handleBackdropClick}>
        {Object.keys(state.clickedShow).length !== 0 ? (
          <ShowBox
            key={`${state.clickedShow.tv_id}`}
            id={state.clickedShow.tv_id + "-mobile"}
            title={state.clickedShow.title}
            poster={state.clickedShow.poster}
            show={state.clickedShow}
            maxHeight={342}
            submitFunc={(event) =>
              handleBackdropShowBox(event, state.clickedShow.tv_id)
            }
            style={{ margin: "auto auto", top: "calc(50% - 171px)" }}
            ref={mobileShowboxRef}
          ></ShowBox>
        ) : null}
      </Backdrop>
    </div>
  );
}
