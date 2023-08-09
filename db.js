const mysql = require("mysql2/promise");

const pool = mysql.createPool({
  host: "localhost",
  user: "kristinajak",
  password: "",
  database: "plantogo",
});

module.exports = pool;
