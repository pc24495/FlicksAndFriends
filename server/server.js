require("dotenv").config();
const express = require("express");

const app = express();

app.use(express.json());

app.get("/");

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is up and listening on port ${PORT}`);
});
