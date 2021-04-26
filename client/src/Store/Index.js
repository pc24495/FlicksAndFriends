import { createStore } from "redux";

const initialState = {
  counter: 0,
  username: null,
  loggedIn: false,
  backdropComponent: "Modal",
  showBackdrop: false,
  shows: [],
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
    return {
      ...state,
      loggedIn: false,
      username: null,
    };
  }

  if (action.type === "CLOSE_BACKDROP") {
    return {
      ...state,
      showBackdrop: false,
    };
  }

  return state;
};

const store = createStore(reducer);

export default store;
