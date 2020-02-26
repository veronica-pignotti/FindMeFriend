var mysql = require('mysql');

var con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: ""/*"passwordmysql$1"*/,
  database: "FMFDatabase",
  port : 3306
});

module.exports.connection = con;