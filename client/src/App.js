import "./App.css";
import Layout from "./Components/Layout/Layout.js";
import { useSelector, useDispatch } from "react-redux";
import MainSection from "./Components/MainSection/MainSection.js";
import axios from "axios";
import { Route, Switch } from "react-router-dom";
import Registration from "./Components/Registration/Registration.js";
import Login from "./Components/Login/Login.js";
import { useEffect } from "react";
// import logo from "./logo.svg";
// import TestComponent from "./Components/TestComponent.js";
// import TestComponent from "./Components/TestComponent.js";

function App() {
  axios.defaults.withCredentials = true;

  const loggedIn = useSelector((state) => state.loggedIn);
  const dispatch = useDispatch();

  let token = localStorage.getItem("token");

  const updateLogin = () => {
    token = localStorage.getItem("token");
    console.log(loggedIn);
    console.log(token);
    if (!(token === null)) {
      console.log("Token valid!");
      console.log(token);
      axios
        .get("http://localhost:3000/api/getUserData", {
          headers: {
            "x-access-token": token,
          },
        })
        .then((res) => {
          if (res.data.auth) {
            dispatch({ type: "LOGIN", username: res.data.userData.username });
          } else {
            dispatch({ type: "LOGOUT" });
          }
        });
    }
  };

  useEffect(updateLogin, [loggedIn]);

  updateLogin();

  return (
    <div>
      <Layout>
        <Switch>
          <Route path="/registration" component={Registration} />
          <Route path="/login" component={Login} />
          <Route path="/" component={MainSection} />
        </Switch>
      </Layout>
    </div>
  );
}

export default App;
