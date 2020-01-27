var mysql = require('mysql');

var con = mysql.createConnection({
  host: "localhost",
  user: "veronica",
  password: "passwordmysql$1",
  database: "FMFDatabase"
});

module.exports.connection = con;