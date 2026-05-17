const { Pool } = require("pg");

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "hotel_db;",
  password: "00000",
  port: 5432,
});

module.exports = pool;