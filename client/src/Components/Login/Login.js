import React, { useState, useEffect, useRef } from "react";
import { useHistory } from "react-router-dom";
import { useDispatch } from "react-redux";
import classes from "./Login.module.css";
import axios from "../../axiosConfig.js";
import { BiUser } from "react-icons/bi";
import { AiFillLock } from "react-icons/ai";
import { FcGoogle } from "react-icons/fc";
import { GoogleLogin } from "react-google-login";
import Backdrop from "../Backdrop/Backdrop.js";

const Login = (props) => {
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
  const [googleState, setGoogleState] = useState({
    showBackdrop: false,
    username: "",
    userID: "",
  });
  const dispatch = useDispatch();
  const history = useHistory();
  const ref = useRef();
  useOnClickOutside(ref, () =>
    setGoogleState((state) => {
      return { ...state, showBackdrop: false };
    })
  );

  const submitLogin = (event) => {
    event.preventDefault();
    console.log("Logging in");
    const username = event.target.elements.username.value;
    const password = event.target.elements.password.value;
    console.log(password);
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
    console.log(newLoginErrors);
    console.log(newLoginErrors.usernameErrors.length);
    console.log(newLoginErrors.passwordErrors.length);
    if (
      newLoginErrors.usernameErrors.length == 0 &&
      newLoginErrors.passwordErrors.length == 0
    ) {
      axios.post("/api/login", { username, password }).then((response) => {
        if (response.data.success) {
          localStorage.setItem("token", response.data.token);
          console.log(response.data.result);
          console.log("Pushing!!");
          dispatch({
            type: "LOGIN",
            username: response.data.result.username,
            profilePic: response.data.result.profile_pic,
            userID: response.data.result.user_id,
          });
          console.log("Pushing!!");
          history.push("/");
        } else {
          console.log(response.data.errors);
          setLoginErrors(response.data.errors);
        }
      });
    } else {
      console.log("Login failed");
      setLoginErrors(newLoginErrors);
    }
  };

  const submitLoginMobile = (event) => {
    event.preventDefault();
    console.log("Lol");
    event.target.elements.username = {};
    event.target.elements.username.value =
      event.target.elements.mobileUsername.value;
    event.target.elements.password = {};
    event.target.elements.password.value =
      event.target.elements.mobilePassword.value;
    submitLogin(event);
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

  const submitRegisterMobile = (event) => {
    event.preventDefault();
    console.log("Lol");
    event.target.elements.username = {};
    event.target.elements.username.value =
      event.target.elements.mobileUsername.value;
    event.target.elements.password = {};
    event.target.elements.password.value =
      event.target.elements.mobilePassword.value;
    event.target.elements.confirmPassword = {};
    event.target.elements.confirmPassword.value =
      event.target.elements.mobileConfirmPassword.value;
    submitRegister(event);
  };

  const changeMode = (event) => {
    setLoginMode((mode) => !mode);
  };

  const googleSuccess = async (res) => {
    const { googleId, email } = res.profileObj;
    axios.post("/api/login/google", { googleId, email }).then((res) => {
      if (res.data.success) {
        if (res.data.firstTime) {
          // console.log(res.data);
          setGoogleState({
            ...googleState,
            showBackdrop: true,
            username: res.data.user.username,
            userID: parseInt(res.data.user.user_id),
          });
        } else {
          localStorage.setItem("token", res.data.token);
          dispatch({
            type: "LOGIN",
            username: res.data.user.username,
            profilePic: res.data.user.profile_pic,
            userID: res.data.user.user_id,
          });
          history.push("/");
        }
      } else {
      }
    });
  };

  const googleFailure = (err) => {
    console.log("Google login failed, try again later");
    console.log(err);
  };

  const handleBackdropClick = (event) => {
    console.log(event);
    setGoogleState((state) => {
      return { showBackdrop: !state.showBackdrop, username: "" };
    });
  };

  const handleSubmitUsername = (event) => {
    axios
      .patch(`/api/users/username`, {
        username: event.target.elements.username_change,
      })
      .then((res) => {
        if (res.data.success) {
          localStorage.setItem("token", res.data.token);
          dispatch({
            type: "LOGIN",
            username: res.data.result.username,
            profilePic: null,
            userID: res.data.result.user_id,
          });
          history.push("/profilepic");
        }
      });
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
          <div
            className={classes.LoginDivInner}
            style={{
              transform: loginMode ? "translateX(0px)" : "translateX(-400px)",
            }}
          >
            <div className={classes.SpacingDiv}>
              <h1 className={classes.LoginOrRegister}>Login</h1>
            </div>
            <form className={classes.LoginBox} onSubmit={submitLogin}>
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
            <div className={classes.SpacingDiv}></div>
          </div>
          <div
            className={classes.LoginDivInner}
            style={{
              transform: loginMode ? "translateX(0px)" : "translateX(-400px)",
            }}
          >
            <div className={classes.SpacingDiv}>
              <h1 className={classes.LoginOrRegister}>Register</h1>
            </div>
            <form className={classes.LoginBox} onSubmit={submitRegister}>
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
            <div className={classes.SpacingDiv}></div>
          </div>
        </div>
      </div>
      <div className={classes.MobileLogin}>
        <div className={classes.MobileFormContainer}>
          <form
            className={classes.MobileForm}
            style={{
              transform: loginMode ? "translateX(0px)" : "translateX(-100vw)",
            }}
            onSubmit={submitLoginMobile}
          >
            <h2>Login</h2>
            <div className={classes.MobileInputContainer}>
              <BiUser className={classes.InputIcon}></BiUser>
              <input
                className={classes.MobileInput}
                placeholder="Enter a username"
                id="mobileUsername"
              ></input>
            </div>
            {loginErrors.usernameErrors.map((err) => {
              return <p className={classes.MobileWarning}>{err}</p>;
            })}
            <div className={classes.MobileInputContainer}>
              <AiFillLock className={classes.InputIcon}></AiFillLock>
              <input
                className={classes.MobilePasswordInput}
                type="password"
                placeholder="Enter a password"
                id="mobilePassword"
              ></input>
            </div>
            {loginErrors.passwordErrors.map((err) => {
              return <p className={classes.MobileWarning}>{err}</p>;
            })}
            <GoogleLogin
              render={(renderProps) => {
                return (
                  <button
                    className={classes.MobileButton}
                    style={{ backgroundColor: "var(--nord7)" }}
                    onClick={renderProps.onClick}
                  >
                    <FcGoogle className={classes.GoogleIconMobile}></FcGoogle>
                    Login With Google{" "}
                  </button>
                );
              }}
              icon={true}
              onSuccess={googleSuccess}
              onFailure={googleFailure}
              cookiePolicy="single_host_origin"
              clientId="939099194810-laea0a5iagfve6irop01euk4rqpdlu94.apps.googleusercontent.com"
            >
              Login With Google{" "}
            </GoogleLogin>
            <button className={classes.MobileButton}> Login </button>
            <p className={classes.LoginOrRegisterMobile} onClick={changeMode}>
              Don't have an account? Click here to make one
            </p>
          </form>

          <form
            className={classes.MobileForm}
            style={{
              transform: loginMode ? "translateX(0px)" : "translateX(-100vw)",
            }}
            onSubmit={submitRegisterMobile}
          >
            <h2>Register</h2>
            <div className={classes.MobileInputContainer}>
              <BiUser className={classes.InputIcon}></BiUser>
              <input
                className={classes.MobileInput}
                placeholder="Enter a username"
                id="mobileUsername"
              ></input>
            </div>
            {registerErrors.usernameErrors.map((err) => {
              return <p className={classes.MobileWarning}>{err}</p>;
            })}
            <div className={classes.MobileInputContainer}>
              <AiFillLock className={classes.InputIcon}></AiFillLock>
              <input
                className={classes.MobilePasswordInput}
                type="password"
                placeholder="Enter a password"
                id="mobilePassword"
              ></input>
            </div>
            {registerErrors.passwordErrors.map((err) => {
              return <p className={classes.MobileWarning}>{err}</p>;
            })}
            <div className={classes.MobileInputContainer}>
              <AiFillLock className={classes.InputIcon}></AiFillLock>
              <input
                className={classes.MobileInput}
                type="password"
                placeholder="Confirm password"
                id="mobileConfirmPassword"
              ></input>
            </div>
            {registerErrors.confirmPasswordErrors.map((err) => {
              return <p className={classes.MobileWarning}>{err}</p>;
            })}
            <GoogleLogin
              clientId="939099194810-laea0a5iagfve6irop01euk4rqpdlu94.apps.googleusercontent.com"
              render={(renderProps) => {
                return (
                  <button
                    className={classes.MobileButton}
                    style={{ backgroundColor: "var(--nord7)" }}
                    onClick={renderProps.onClick}
                  >
                    <FcGoogle className={classes.GoogleIconMobile}></FcGoogle>
                    Login With Google{" "}
                  </button>
                );
              }}
              icon={true}
              onSuccess={googleSuccess}
              onFailure={googleFailure}
              cookiePolicy="single_host_origin"
            >
              Login With Google{" "}
            </GoogleLogin>
            <button className={classes.MobileButton}> Register </button>
            <p className={classes.LoginOrRegisterMobile} onClick={changeMode}>
              Already have an account? Click here to log in
            </p>
          </form>
        </div>
      </div>
      <Backdrop showBackdrop={googleState.showBackdrop} id="backdrop">
        <div className={classes.UsernameBox} ref={ref}>
          <p>Please input a username: </p>
          <form onSubmit={handleSubmitUsername}>
            <input
              className={classes.UsernameInput}
              value={googleState.username}
              id="username_change"
            ></input>
          </form>
          <button>Submit</button>
        </div>
      </Backdrop>
    </div>
  );
};

function useOnClickOutside(ref, handler) {
  useEffect(
    () => {
      const listener = (event) => {
        // Do nothing if clicking ref's element or descendent elements
        if (!ref.current || ref.current.contains(event.target)) {
          return;
        }
        handler(event);
      };
      document.addEventListener("mousedown", listener);
      document.addEventListener("touchstart", listener);
      return () => {
        document.removeEventListener("mousedown", listener);
        document.removeEventListener("touchstart", listener);
      };
    },
    // Add ref and handler to effect dependencies
    // It's worth noting that because passed in handler is a new ...
    // ... function on every render that will cause this effect ...
    // ... callback/cleanup to run every render. It's not a big deal ...
    // ... but to optimize you can wrap handler in useCallback before ...
    // ... passing it into this hook.
    [ref, handler]
  );
}

// <FcGoogle className={classes.GoogleIconMobile}></FcGoogle>

export default Login;
