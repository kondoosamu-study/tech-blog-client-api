const mysql = require('mysql');
const connection = mysql.createPool({
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASS,
  port: process.env.MYSQL_PORT,
  database: process.env.MYSQL_DB_NAME
});

module.exports = connection;
