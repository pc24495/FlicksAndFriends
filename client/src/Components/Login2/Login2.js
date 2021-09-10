import React, { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import { useDispatch } from "react-redux";
import classes from "./Login2.module.css";
import axios from "../../axiosConfig.js";

const Login2 = (props) => {
  const [loginMode, setLoginMode] = useState(true);
  const [loginErrors, setLoginErrors] = useState({
    usernameErrors: [],
    passwordErrors: [],
  });
  const [registerErrors, setRegisterErrors] = useState({
    usernameErrors: [],
    passwordErrors: [],
    confirmPasswordErrors: [],
  });
  const dispatch = useDispatch();
  const history = useHistory();

  const submitLogin = (event) => {
    event.preventDefault();
    const username = event.target.elements.username.value;
    const password = event.target.elements.password.value;
    const newLoginErrors = {
      usernameErrors: [],
      passwordErrors: [],
    };
    if (username === null || username === "") {
      newLoginErrors.usernameErrors.push("Please enter a password");
    }
    if (password === null || password === "") {
      newLoginErrors.passwordErrors.push("Please enter a password");
    }

    if (
      newLoginErrors.usernameErrors.length == 0 &&
      newLoginErrors.passwordErrors.length == 0
    ) {
      axios.post("/api/login", { username, password }).then((response) => {
        if (response.data.success) {
          localStorage.setItem("token", response.data.token);
          console.log(response.data.result);
          dispatch({
            type: "LOGIN",
            username: response.data.result.username,
            profilePic: response.data.result.profile_pic,
            userID: response.data.result.user_id,
          });
        } else {
          setLoginErrors(response.data.errors);
        }
      });
    } else {
      setLoginErrors(newLoginErrors);
    }
  };

  const submitRegister = (event) => {
    event.preventDefault();
    const username = event.target.elements.username.value;
    const password = event.target.elements.password.value;
    const confirmPassword = event.target.elements.confirmPassword.value;
    console.log(password);
    const newRegisterErrors = {
      usernameErrors: [],
      passwordErrors: [],
      confirmPasswordErrors: [],
    };
    console.log(password.length);
    console.log(/[~`!#$%\^&*+=\-\[\]\\';,/{}|\\":<>\?@]/g.test(password));
    if (password === null || password === "") {
      newRegisterErrors.passwordErrors.push("Please enter a password");
    } else if (
      !(password.length >= 10) ||
      !/[~`!#$%\^&*+=\-\[\]\\';,/{}|\\":<>\?]/g.test(password) ||
      !/\d/.test(password)
    ) {
      newRegisterErrors.passwordErrors.push(
        "Passwords must be at least 10 characters long and contain at least one number and one special character"
      );
    }
    if (password !== confirmPassword) {
      newRegisterErrors.confirmPasswordErrors.push("Passwords do not match");
    }

    if (username === null || username === "") {
      newRegisterErrors.usernameErrors.push("Please enter a username");
    } else if (username.length > 20) {
      newRegisterErrors.usernameErrors.push(
        "Usernames must be less than 20 characters long"
      );
    }
    console.log(newRegisterErrors.usernameErrors.length);
    console.log(newRegisterErrors.passwordErrors.length);
    console.log(newRegisterErrors.confirmPasswordErrors.length);
    if (
      newRegisterErrors.usernameErrors.length === 0 &&
      newRegisterErrors.passwordErrors.length === 0 &&
      newRegisterErrors.confirmPasswordErrors.length === 0
    ) {
      axios
        .post("/api/register", {
          username,
          password,
        })
        .then((response) => {
          if (!response.data.success) {
            setRegisterErrors(response.data.errors);
          } else {
            axios
              .post("/api/login", {
                username,
                password,
              })
              .then((res) => {
                //   console.log("Setting token");
                if (res.data.success) {
                  console.log(res.data.result);
                  localStorage.setItem("token", res.data.token);
                  dispatch({
                    type: "LOGIN",
                    username: res.data.result.username,
                    profilePic: null,
                    userID: res.data.result.user_id,
                  });
                  props.history.push("/profilepic");
                } else {
                  setRegisterErrors({
                    ...res.data.errors,
                    confirmPasswordErrors: [],
                  });
                }
              });
          }
        });
    } else {
      setRegisterErrors(newRegisterErrors);
    }
  };

  const changeMode = (event) => {
    setLoginMode((mode) => !mode);
  };

  return (
    <div className={classes.LoginOuter}>
      <div className={classes.Login}>
        <div className={classes.Text}>
          <div className={classes.TextInner}>
            <h2>Welcome to Flicks and Friends!</h2>
            <div>
              <p>
                Please skim the following text for the best experience, and make
                sure to read the warnings!
              </p>
              <p>
                Flicks and friends is a social media app that lets you discuss
                your favorite shows with other fans without having plotpoints
                spoiled. When you make an account, you'll be asked to select a
                profile picture, then redirected to a screen where you can
                subscribe to your favorite shows. When you add a show to your
                subscriptions list, be sure to select the <b>last</b> episode
                you watched. This will ensure that any posts discussing plot
                points from future episodes will be filtered out of your feed.
                Similarly, when you create a post, you'll be asked to select
                whether it is an <b>announcement</b> post, or a <b>spoiler</b>{" "}
                post. If it is a spoiler post, you must select the season and
                episode of the last plot point that it discusses.
              </p>
              <p>
                <span style={{ color: "var(--nord11)" }}>Warnings: </span>
              </p>
              <ul>
                <li>
                  Flicks and Friends is a <b>work in progress,</b> we cannot
                  promise the best security features so please{" "}
                  <span style={{ color: "var(--nord11)" }}>
                    do not choose a password that you use for other sites.
                  </span>
                </li>
                <li>
                  We are also working on a system that will allow users to
                  report posts that discuss plot points past the episode they
                  are labeled with. Until this system is finalized,{" "}
                  <b>
                    please be courteous to others and avoid spoiling episodes!
                  </b>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <div className={classes.GridGap}></div>
        <div className={classes.LoginDiv}>
          <form
            className={classes.LoginBox}
            onSubmit={submitLogin}
            style={{
              transform: loginMode ? "translateX(0%)" : "translateX(-100%)",
            }}
          >
            <div className={classes.InputSection}>
              <label for="username">Username</label>
              <input type="text" name="username" id="username"></input>
              {loginErrors.usernameErrors.map((err) => {
                return <p className={classes.Warning}>{err}</p>;
              })}
            </div>
            <div className={classes.InputSection}>
              <label for="password">Password</label>
              <input type="password" name="password" id="password"></input>
              {loginErrors.passwordErrors.map((err) => {
                return <p className={classes.Warning}>{err}</p>;
              })}
            </div>
            <button className={classes.SubmitButton}>Submit</button>
            <p className={classes.SwitchModeClick} onClick={changeMode}>
              Don't have an account? Click here to make one
            </p>
          </form>
          <form
            className={classes.LoginBox}
            onSubmit={submitRegister}
            style={{
              transform: loginMode ? "translateX(0%)" : "translateX(-100%)",
            }}
          >
            <div className={classes.InputSection}>
              <label for="username">Username</label>
              <input type="text" name="username" id="username"></input>
              {registerErrors.usernameErrors.map((err) => {
                return <p className={classes.Warning}>{err}</p>;
              })}
            </div>
            <div className={classes.InputSection}>
              <label for="password">Password</label>
              <input type="password" name="password" id="password"></input>
              {registerErrors.passwordErrors.map((err) => {
                return <p className={classes.Warning}>{err}</p>;
              })}
            </div>
            <div className={classes.InputSection}>
              <label for="confirmPassword">Confirm Password</label>
              <input
                type="password"
                name="confirmPassword"
                id="confirmPassword"
              ></input>
              {registerErrors.confirmPasswordErrors.map((err) => {
                return <p className={classes.Warning}>{err}</p>;
              })}
            </div>
            <button className={classes.SubmitButton}>Submit</button>
            <p className={classes.SwitchModeClick} onClick={changeMode}>
              Already have an account? Click here to log in
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login2;
