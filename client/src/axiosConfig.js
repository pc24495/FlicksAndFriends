import axios from "axios";
// Next we make an 'instance' of it
const instance = axios.create({
  // .. where we make our configurations
  baseURL:
    process.env.NODE_ENV === "production" ? "/" : "http://localhost:3000",
});

export default instance;
