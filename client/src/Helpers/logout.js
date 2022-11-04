import axios from "axios";

const logoutTest = (token) => {
  console.log("Logout token", token);
  axios.delete("/api/login/test", {
    headers: {
      "x-access-token": token,
    },
  });
};

export default logoutTest;
