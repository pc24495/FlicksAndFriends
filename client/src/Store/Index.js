import { createStore } from "redux";

// const initialState = {
//   counter: 0,
//   user: null,
// };

const reducer = (state = { counter: 0 }, action) => {
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
  } else {
    return state;
  }
};

const store = createStore(reducer);
console.log(store);

export default store;
