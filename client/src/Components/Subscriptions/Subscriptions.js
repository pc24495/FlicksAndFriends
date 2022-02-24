import React, { useState, useEffect, useRef, useCallback } from "react";
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
import useFetch from "./useFetch.js";

const Subscriptions = (props) => {
  const loader = useRef(null);
  const loaderMobile = useRef(null);
  const mobileShowboxRef = useRef();
  const [page, setPage] = useState(0);
  const [option2, setOption2] = useState({
    root: null,
    rootMargin: "20px",
    threshold: 0,
  });
  const currentSubscriptions = useSelector((state) => state.Subscriptions);
  const [latestAddedSubscription, setLatestAddedSubscription] = useState({
    invalid: true,
  });
  const [latestRemovedSubscription, setLatestRemovedSubscription] = useState({
    invalid: true,
  });
  const [searchMode, setSearchMode] = useState(false);
  const searchValue = useSelector((state) => state.searchValue);
  const {
    notSubscribedShows,
    subscriptions,
    filteredShows,
    isFiltering,
  } = useFetch(
    page,
    currentSubscriptions,
    latestAddedSubscription,
    latestRemovedSubscription,
    searchValue
  );
  const [dropTags, setDropTags] = useState(false);
  const mobileCutoff = useMediaQuery("(max-width:610px)");
  const [mobileState, setMobileState] = useState({
    showBackdrop: false,
    clickedShow: {},
  });
  const [showExplanationBackdrop, setShowExplanationBackdrop] = useState(false);
  const dispatch = useDispatch();
  const handleObserver = useCallback((entries) => {
    const target = entries[0];
    if (target.isIntersecting) {
      setPage((prev) => prev + 1);
    }
  }, []);

  const handleObserver2 = useCallback((entries) => {
    const target = entries[0];
    if (target.isIntersecting) {
      setPage((prev) => prev + 1);
    }
  }, []);

  useEffect(() => {
    const option = {
      root: null,
      rootMargin: "20px",
      threshold: 0,
    };
    const observer = new IntersectionObserver(handleObserver, option);
    const observer2 = new IntersectionObserver(handleObserver2, option2);
    if (loader.current) observer.observe(loader.current);
    if (loaderMobile.current) observer2.observe(loaderMobile.current);
  }, [handleObserver, option2]);

  useEffect(() => {
    setOption2({
      root: document.getElementById("SelectorMobile"),
      rootMargin: "20px",
      threshold: 0,
    });
  }, []);

  useEffect(() => {
    axios
      .get("api/users/subscription_explanation", {
        headers: {
          "x-access-token": localStorage.getItem("token"),
        },
      })
      .then((response) => {
        setShowExplanationBackdrop(response.data.subscription_explanation);
      });
  }, []);

  useEffect(() => {
    setOption2({
      root: document.getElementById("SelectorMobile"),
      rootMargin: "20px",
      threshold: 0,
    });
  }, [searchMode]);

  const addSubscriptions = (event, tv_id) => {
    const subscription = JSON.parse(
      document.getElementById(tv_id).dataset.subscription
    );
    setLatestAddedSubscription(subscription);
  };

  const deleteSubscriptions = (event, sub) => {
    setLatestRemovedSubscription(sub);
  };

  const submitSubscriptions = (event) => {
    let token = localStorage.getItem("token");
    // console.log(state.subscriptions);
    axios
      .patch("/api/users/subscriptions", {
        subscriptions: JSON.stringify(subscriptions),
        headers: {
          "x-access-token": token,
        },
      })
      .then((res) => {
        dispatch({
          type: "UPDATE_SUBSCRIPTIONS",
          subscriptions: subscriptions,
        });
        props.history.push("/");
      });
  };

  const handleMobileShowClick = (event, show) => {
    setMobileState({ showBackdrop: true, clickedShow: show });
  };

  const handleBackdropClick = (event) => {
    if (!mobileShowboxRef.current.contains(event.target)) {
      setMobileState({ ...mobileState, showBackdrop: false });
    }
  };

  const handleBackdropShowBox = async (event, tv_id) => {
    const subscription = JSON.parse(
      document.getElementById(tv_id + "-mobile").dataset.subscription
    );
    await setLatestAddedSubscription(subscription);
    await setMobileState({ ...mobileState, showBackdrop: false });
  };

  const handleMobileSearch = (event) => {
    dispatch({ type: "SEARCH", searchValue: event.target.value });
  };

  const handleExplanations = (event) => {
    event.preventDefault();
    if (event.target.elements.show_explanation.checked) {
      axios.patch("api/users/subscription_explanation", {
        headers: {
          "x-access-token": localStorage.getItem("token"),
        },

        subscription_explanation: false,
      });
    }
    setShowExplanationBackdrop(false);
  };

  return (
    <div className={classes.Subscriptions}>
      <div className={classes.FixedElements}>
        {subscriptions && subscriptions.length !== 0 && (
          <div
            className={classes.ShowTags}
            style={{
              display: subscriptions.length > 0 ? "block" : "none",
            }}
          >
            <div
              className={classes.ShowTagContainer}
              style={{ height: dropTags ? "fit-content" : "35px" }}
            >
              {subscriptions.map((show) => (
                <p className={classes.ShowTag} key={show.show_title}>
                  {show.show_title}
                  <span
                    className={classes.CloseButton}
                    onClick={(event) => deleteSubscriptions(event, show)}
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
                  transform: dropTags ? "rotate(180deg)" : "rotate(0deg)",
                }}
                onClick={() => setDropTags((d) => !d)}
              ></BsCaretUpFill>
              <button onClick={submitSubscriptions} className={classes.Button}>
                Submit
              </button>
            </div>
          </div>
        )}
        {searchMode && mobileCutoff ? (
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
                onClick={() => setSearchMode(false)}
              >
                x
              </AiOutlineClose>
            </div>
          </div>
        ) : null}
      </div>
      <div
        className={classes.SelectorContainer}
        style={{
          top: searchMode
            ? subscriptions.length === 0 || !subscriptions
              ? "100px"
              : "200px"
            : subscriptions.length === 0 || !subscriptions
            ? "20px"
            : "120px",
        }}
      >
        {!mobileCutoff && !isFiltering && (
          <div className={classes.Selector}>
            {notSubscribedShows &&
              notSubscribedShows.map((show, index) => {
                return (
                  <ShowBox
                    key={`${show.tv_id}`}
                    id={show.tv_id}
                    title={show.title}
                    poster={show.poster}
                    show={show}
                    maxHeight={342}
                    submitFunc={(event) => addSubscriptions(event, show.tv_id)}
                  ></ShowBox>
                );
              })}
            <div className={classes.LoadingShowBox} ref={loader}>
              <div className={classes.loader}></div>
            </div>
            <div className={classes.LoadingShowBox}>
              <div className={classes.loader}></div>
            </div>
            <div className={classes.LoadingShowBox}>
              <div className={classes.loader}></div>
            </div>
          </div>
        )}
        {!mobileCutoff && isFiltering && (
          <div className={classes.Selector}>
            {filteredShows &&
              filteredShows.map((show, index) => {
                return (
                  <ShowBox
                    key={`${show.tv_id}`}
                    id={show.tv_id}
                    title={show.title}
                    poster={show.poster}
                    show={show}
                    maxHeight={342}
                    submitFunc={(event) => addSubscriptions(event, show.tv_id)}
                  ></ShowBox>
                );
              })}
            <div style={{ height: "340px", width: "340px" }}></div>
            <div style={{ height: "340px", width: "340px" }}></div>
            <div style={{ height: "340px", width: "340px" }}></div>
          </div>
        )}
        {mobileCutoff && !isFiltering && (
          <div className={classes.SelectorMobile} id="SelectorMobile">
            {notSubscribedShows &&
              notSubscribedShows.map((show, index) => (
                <div className={classes.ShowTitleBox}>
                  <p onClick={(event) => handleMobileShowClick(event, show)}>
                    {show.title}
                  </p>
                </div>
              ))}

            <div className={classes.MobileLoader} ref={loaderMobile}></div>
          </div>
        )}
        {mobileCutoff && isFiltering && (
          <div className={classes.SelectorMobile} id="SelectorMobile">
            {filteredShows &&
              filteredShows.map((show, index) => (
                <div className={classes.ShowTitleBox}>
                  <p onClick={(event) => handleMobileShowClick(event, show)}>
                    {show.title}
                  </p>
                </div>
              ))}
            <div className={classes.ShowTitleBox}></div>
            <div className={classes.ShowTitleBox}></div>
          </div>
        )}
      </div>
      {!searchMode ? (
        <div
          className={classes.SearchIconContainer}
          onClick={() => {
            dispatch({ type: "SEARCH", searchValue: "" });
            setSearchMode(true);
          }}
        >
          <BsSearch className={classes.SearchIcon}></BsSearch>
        </div>
      ) : null}
      <Backdrop
        showBackdrop={mobileState.showBackdrop}
        onClick={handleBackdropClick}
      >
        {Object.keys(mobileState.clickedShow).length !== 0 ? (
          <ShowBox
            key={`${mobileState.clickedShow.tv_id}`}
            id={mobileState.clickedShow.tv_id + "-mobile"}
            title={mobileState.clickedShow.title}
            poster={mobileState.clickedShow.poster}
            show={mobileState.clickedShow}
            maxHeight={342}
            submitFunc={(event) =>
              handleBackdropShowBox(event, mobileState.clickedShow.tv_id)
            }
            style={{ margin: "auto auto", top: "calc(50% - 171px)" }}
            ref={mobileShowboxRef}
          ></ShowBox>
        ) : null}
      </Backdrop>
      <div
        className={classes.ExplanationBackdrop}
        style={{ display: showExplanationBackdrop ? "flex" : "none" }}
      >
        <div className={classes.ExplanationModal}>
          <div className={classes.ExplanationModalInner}>
            <p>
              Welcome to the subscriptions page! Please follow these
              instructions for the best experience:{" "}
            </p>
            <h3>Mobile:</h3>
            <p>
              Click on the title of a show you're watching. You can scroll down
              until you see a title you recognize or click the search icon in
              the bottom-right to bring up a search bar. Clicking on the title
              will bring up a popup for the show. Select the LAST episode you
              watched and click submit to add it to your subscriptions. Once
              you've added at least one show to your subscriptions, you'll see
              your list of tags of your subsrcibed shows at the top of the
              screen below the navigation bar. You can click on the "x" next to
              a show's title to remove it from your subscriptions list, but keep
              in mind changes will not be saved until you click "submit" on the
              show tag bar.{" "}
            </p>
          </div>
          <form
            className={classes.ExplanationForm}
            onSubmit={handleExplanations}
          >
            <div className={classes.CheckboxContainer}>
              <input
                type="checkbox"
                id="show_explanation"
                name="show_explanation"
              ></input>
              <label for="show_explanation">
                Don't show this message again
              </label>
            </div>
            <button className={classes.SubmitButton}>Submit</button>
          </form>
          <p
            className={classes.ModalClose}
            onClick={() => setShowExplanationBackdrop(false)}
          >
            x
          </p>
        </div>
      </div>
    </div>
  );
};

export default Subscriptions;
