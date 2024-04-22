const express = require("express");
const {geminiapi , getTest, getDetails } = require("./geminiapi")
const app = express.Router();
app.post("/add", geminiapi );
app.post("/test" , getTest);
app.post("/learn" , getDetails);
module.exports = app;