import "./App.css";
import Layout from "./Components/Layout/Layout.js";
import { useSelector, useDispatch } from "react-redux";
import MainSection from "./Components/MainSection/MainSection.js";
import Subscriptions from "./Components/Subscriptions/Subscriptions.js";
import axios from "./axiosConfig.js";
import { Route, Switch, useHistory } from "react-router-dom";
import Registration from "./Components/Registration/Registration.js";
import ProfilePicUpload from "./Components/Registration/ProfilePicUpload/ProfilePicUpload.js";
import Login from "./Components/Login/Login.js";
import CreatePost from "./Components/CreatePost/CreatePost.js";
import { useEffect } from "react";
import FriendRequests from "./Components/FriendRequests/FriendRequests.js";
import Friends from "./Components/Friends/Friends.js";
import logoutTest from "./Helpers/logout.js";

function App(props) {
  const history = useHistory();
  axios.defaults.withCredentials = true;

  const loggedIn = useSelector((state) => state.loggedIn);
  const dispatch = useDispatch();

  let token = localStorage.getItem("token");

  const getSubscriptions = () => {
    axios
      .get("/api/users/subscriptions", {
        headers: {
          "x-access-token": token,
        },
      })
      .then((res) => {
        // console.log(res.data.subscriptions);
        // console.log(res.data);
        dispatch({
          type: "UPDATE_SUBSCRIPTIONS",
          subscriptions: res.data.subscriptions,
        });
      });
  };

  const updateLogin = () => {
    // eslint-disable-next-line
    token = localStorage.getItem("token");

    if (!(token === null)) {
      axios
        .get("/api/users", {
          headers: {
            "x-access-token": token,
          },
        })
        .then((res) => {
          if (res.data.auth === true) {
            // console.log(res.data);
            dispatch({
              type: "LOGIN",
              username: res.data.userData.username,
              profilePic: res.data.userData.profile_pic,
              userID: parseInt(res.data.userData.user_id),
            });
            // getShows();
            getSubscriptions();
          } else {
            // console.log("Auth failed");
            logoutTest(localStorage.getItem("token"));
            dispatch({ type: "LOGOUT" });
            history.push("/");
          }
        });
    } else {
      // console.log("No token");
      logoutTest(localStorage.getItem("token"));
      dispatch({ type: "LOGOUT" });
      history.push("/");
    }
  };

  useEffect(updateLogin, [loggedIn]);

  updateLogin();
  getSubscriptions();

  // console.log(loggedIn);
  return (
    <div>
      <Layout>
        <Switch>
          <Route path="/subscriptions" component={Subscriptions}></Route>
          <Route path="/registration" component={Registration} />
          <Route path="/profilepic" component={ProfilePicUpload}></Route>
          <Route path="/create-post" component={CreatePost}></Route>
          <Route path="/friend-requests" component={FriendRequests}></Route>
          <Route path="/friends" component={Friends}></Route>
          <Route path="/login" component={Login} />
          {loggedIn || localStorage.getItem("token") ? (
            <Route path="/" component={MainSection} />
          ) : (
            <Route path="/" component={Login} />
          )}
        </Switch>
      </Layout>
    </div>
  );
}

export default App;
