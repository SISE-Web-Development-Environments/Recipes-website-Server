require("dotenv").config();
const sql = require("mssql");

const config= {
    user: process.env.tedious_userName,
    password:  process.env.tedious_password,
    server: process.env.tedious_server,
    database: process.env.tedious_database
};
sql
    .connect(config)
    .then(console.log("connect!!"));
