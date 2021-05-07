import { createStore } from "redux";

const initialState = {
  counter: 0,
  username: null,
  loggedIn: false,
  backdropComponent: "Modal",
  showBackdrop: false,
  shows: [
    // { title: "Breaking Bad" },
    // { title: "Game of Thrones" },
    // { title: "Seinfeld" },
    // {
    //   title:
    //     "This Is A Really Long Show Title It's to Test that the show title wrap works",
    // },
  ],
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
    };
  }

  if (action.type === "LOGOUT") {
    localStorage.clear();
    return {
      ...state,
      loggedIn: false,
      username: null,
      shows: [],
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

  return state;
};

const store = createStore(reducer);

export default store;
