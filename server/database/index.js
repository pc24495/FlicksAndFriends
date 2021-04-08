const pkg = require("pg");
const { Pool } = pkg;

const pool = new Pool();

module.exports = {
  query: (text, params, func) => pool.query(text, params, func),
};
