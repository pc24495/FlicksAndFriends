import "./App.css";
import Layout from "./Components/Layout/Layout.js";
import { useSelector, useDispatch } from "react-redux";
import MainSection from "./Components/MainSection/MainSection.js";
import Subscriptions from "./Components/Subscriptions/Subscriptions2.js";
import axios from "./axiosConfig.js";
import { Route, Switch, useHistory } from "react-router-dom";
import Registration from "./Components/Registration/Registration.js";
import ProfilePicUpload from "./Components/Registration/ProfilePicUpload/ProfilePicUpload.js";
import Login from "./Components/Login/Login.js";
import CreatePost from "./Components/CreatePost/CreatePost.js";
import { useEffect } from "react";
// import logo from "./logo.svg";
// import TestComponent from "./Components/TestComponent.js";
// import TestComponent from "./Components/TestComponent.js";

function App(props) {
  const history = useHistory();
  axios.defaults.withCredentials = true;

  const loggedIn = useSelector((state) => state.loggedIn);
  const dispatch = useDispatch();

  let token = localStorage.getItem("token");

  console.log("Starting main page");
  const resizeWindow = (event) => {
    dispatch({
      type: "SET_WINDOW_WIDTH",
      windowWidth: window.innerWidth,
      windowHeight: window.innerHeight,
    });
  };

  useEffect(() => {
    window.addEventListener("resize", resizeWindow);
  }, []);

  // const getShows = () => {
  //   axios.get("/api/GetAllShows").then((res) => {
  //     dispatch({ type: "UPDATE_SHOWS", shows: res.data });
  //   });
  // };

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
    token = localStorage.getItem("token");
    // console.log(loggedIn);
    // console.log(token);
    if (!(token === null)) {
      // console.log("Token valid!");
      // console.log(token);
      axios
        .get("/api/getUserData", {
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
            });
            // getShows();
            getSubscriptions();
          } else {
            dispatch({ type: "LOGOUT" });
            history.push("/");
          }
        });
    } else {
      dispatch({ type: "LOGOUT" });
      history.push("/");
    }
  };

  useEffect(updateLogin, [loggedIn]);

  updateLogin();
  getSubscriptions();
  // getShows();

  // getShows();
  // console.log(Registration);
  // console.log(ProfilePicUpload);

  return (
    <div>
      <Layout>
        <Switch>
          <Route path="/submitpost" component={CreatePost} />
          <Route path="/subscriptions" component={Subscriptions}></Route>
          <Route path="/registration" component={Registration} />
          <Route path="/profilepic" component={ProfilePicUpload}></Route>
          <Route path="/login" component={Login} />
          <Route path="/" component={MainSection} />
        </Switch>
      </Layout>
    </div>
  );
}

export default App;
