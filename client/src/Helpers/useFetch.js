import { useState, useEffect, useCallback, useRef } from "react";
import axios from "axios";
import qs from "qs";

function useFetch(query, page, subscriptions, removedID) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [postList, setList] = useState([]);
  const [done, setDone] = useState(false);
  const [userPicsMap, setUserPicsMap] = useState(new Map());
  const IDs = useRef("");
  const pageRef = useRef(0);
  const remove = useRef(null);

  const sendQuery = useCallback(async () => {
    if (subscriptions === undefined) return;
    if (subscriptions.length === 0) return;
    if (removedID) {
      if (removedID !== remove.current) {
        remove.current = removedID;
        setList((list) => list.filter((post) => post.post_id !== removedID));
      }
    }
    // console.log(subscriptions.map((sub) => sub.show_id).join("-"));
    const subIDsString = subscriptions.map((sub) => sub.show_id).join("-");
    if (subIDsString === useRef.current && pageRef.current === page) {
      return;
    } else {
      useRef.current = subIDsString;
      pageRef.current = page;
    }
    // console.log(page);
    // console.log(subscriptions);
    // console.log(query);
    try {
      //   console.log("Setting loading");
      await setLoading(true);
      await setError(false);
      const res = await axios.get("/api/posts", {
        params: {
          postIDs: postList.map((post) => post.post_id),
          userIDs: [...userPicsMap.keys()],
          subscriptionIDs: subscriptions.map((sub) => sub.show_id),
        },
        paramsSerializer: (params) => {
          return qs.stringify(params);
        },
        headers: {
          "x-access-token": localStorage.getItem("token"),
        },
      });

      await setList(postList.concat(res.data.posts));
      //   console.log(new Map(JSON.parse(res.data.userPics)));
      await setUserPicsMap(
        (prev) => new Map([...prev, ...new Map(JSON.parse(res.data.userPics))])
      );
      if (res.data.posts.length < 3) {
        // console.log(res.data.posts.length);
        await setDone(true);
      }
      //   console.log("Unsetting loading");
      setLoading(false);
    } catch (err) {
      setError(err);
    }
  }, [query, page, subscriptions, removedID]);

  useEffect(() => {
    sendQuery(query);
  }, [query, sendQuery, page, subscriptions, removedID]);

  return { loading, error, postList, done, userPicsMap };
}

export default useFetch;
