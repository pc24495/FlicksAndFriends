import { useState, useEffect, useCallback, useRef } from "react";
import axios from "axios";

import qs from "qs";

function useFetch(
  page,
  currentSubscriptions,
  latestAddedSubscription,
  latestRemovedSubscription,
  searchValue
) {
  const [shows, setShows] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [subscribedShows, setSubscribedShows] = useState([]);
  const [notSubscribedShows, setNotSubscribedShows] = useState([]);
  const subscriptionsRef = useRef("");
  const [filteredShows, setFilteredShows] = useState();
  const [isFiltering, setIsFiltering] = useState(false);
  let source = axios.CancelToken.source();

  const getInitialShowsAndSubscriptions = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    await axios
      .get("/api/users/subscriptions-and-shows", {
        headers: {
          "x-access-token": token,
        },
        params: {
          limit: 12,
        },
      })
      .then(async (res) => {
        // if();
        await setShows([...res.data.subscribedShows, ...res.data.shows]);
        await setNotSubscribedShows(res.data.shows);
        await setSubscribedShows(res.data.subscribedShows);
        await setSubscriptions(res.data.subscriptions);
      });
  };

  const getMoreShows = useCallback(async () => {
    const token = localStorage.getItem("token");
    const excludeIDs = shows.map((show) => show.show_id);
    if (!token) return;
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
          return qs.stringify(params);
        },
      })
      .then(async (res) => {
        if (!res.data.shows) return;
        await setNotSubscribedShows([...notSubscribedShows, ...res.data.shows]);
        await setShows([...shows, ...res.data.shows]);
      });
  }, [page]);

  const addSubscription = async () => {
    if (latestAddedSubscription.invalid) return;
    const newSubscribedShows = [
      ...subscribedShows,
      notSubscribedShows.find(
        (show) => show.tv_id === latestAddedSubscription.show_id
      ),
    ];
    const filteredShows = notSubscribedShows.filter((show) => {
      if (show.tv_id === latestAddedSubscription.show_id) {
        return false;
      } else {
        return true;
      }
    });
    const newSubscriptions = [...subscriptions, latestAddedSubscription];
    await setNotSubscribedShows(filteredShows);
    await setSubscriptions(newSubscriptions);
    await setSubscribedShows(newSubscribedShows);
  };

  const removeSubscription = async () => {
    if (latestRemovedSubscription.invalid) return;
    const newSubscribedShows = subscribedShows.filter(
      (show) => show.tv_id !== latestRemovedSubscription.show_id
    );
    const reAddShow = shows.find(
      (show) => show.tv_id === latestRemovedSubscription.show_id
    );
    const filteredShows = [reAddShow, ...notSubscribedShows];
    const newSubscriptions = subscriptions.filter(
      (sub) => sub.show_id !== latestRemovedSubscription.show_id
    );
    await setNotSubscribedShows(filteredShows);
    await setSubscriptions(newSubscriptions);
    await setSubscribedShows(newSubscribedShows);
  };

  const searchShow = () => {
    source.cancel();
    // eslint-disable-next-line
    source = axios.CancelToken.source();
    const token = localStorage.getItem("token");
    setTimeout(() => {
      if (
        searchValue &&
        searchValue.trim() !== null &&
        searchValue.trim() !== ""
      ) {
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
          .then(async (res) => {
            const newFilteredShows = res.data.shows;
            await setIsFiltering(true);
            await setFilteredShows(newFilteredShows);
          });
      } else {
        setIsFiltering(false);
      }
    }, 200);
  };

  useEffect(() => {
    getInitialShowsAndSubscriptions();
  }, []);

  useEffect(() => {
    if (page !== 0) getMoreShows();
  }, [page]);

  useEffect(() => {
    addSubscription();
  }, [latestAddedSubscription]);

  useEffect(() => {
    removeSubscription();
  }, [latestRemovedSubscription]);

  useEffect(() => {
    searchShow();
  }, [searchValue]);

  return { notSubscribedShows, subscriptions, filteredShows, isFiltering };
}

export default useFetch;
