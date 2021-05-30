import { createStore } from "redux";

const initialState = {
  counter: 0,
  username: null,
  loggedIn: false,
  backdropComponent: "Modal",
  showBackdrop: true,
  showAlert: false,
  shows: [
    // { title: "Breaking Bad" },
    // { title: "Game of Thrones" },
    // { title: "Seinfeld" },
    // {
    //   title:
    //     "This Is A Really Long Show Title It's to Test that the show title wrap works",
    // },
  ],
  subscriptions: [],
  windowWidth: 1440,
  windowHeight: 0,
  profilePic: null,
};

const reducer = (state = initialState, action) => {
  if (action.type === "INCREMENT") {
    return {
      ...state,
      counter: state.counter + 1,
    };
  }

  if (action.type === "DECREMENT") {
    return {
      ...state,
      counter: state.counter - 1,
    };
  }

  if (action.type === "LOGIN") {
    return {
      ...state,
      loggedIn: true,
      username: action.username,
      profilePic: action.profilePic,
    };
  }

  if (action.type === "LOGOUT") {
    localStorage.clear();
    return {
      ...state,
      loggedIn: false,
      username: null,
      shows: [],
      profilePic: null,
    };
  }

  if (action.type === "CLOSE_BACKDROP") {
    return {
      ...state,
      showBackdrop: false,
    };
  }

  if (action.type === "UPDATE_SHOWS") {
    // console.log(action.shows);
    return {
      ...state,
      shows: action.shows,
    };
  }

  if (action.type === "UPDATE_SUBSCRIPTIONS") {
    // console.log(action.subscriptions);
    // console.log(action.shows);
    return {
      ...state,
      subscriptions: action.subscriptions,
    };
  }

  if (action.type === "SET_WINDOW_WIDTH") {
    return {
      ...state,
      windowWidth: action.windowWidth,
      windowHeight: action.windowHeight,
    };
  }

  if (action.type === "SHOW_BACKDROP") {
    return {
      ...state,
      showBackdrop: true,
    };
  }

  if (action.type === "SHOW_ALERT") {
    return {
      ...state,
      showAlert: true,
    };
  }

  if (action.type === "CLOSE_ALERT") {
    return {
      ...state,
      showBackdrop: false,
      showAlert: false,
    };
  }

  if (action.type === "UPDATE_PROFILE_PIC") {
    return {
      ...state,
      profilePic: action.profilePic,
    };
  }

  return state;
};

const store = createStore(reducer);

export default store;
