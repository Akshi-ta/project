const express = require("express");
const { fetchSubtopics } = require("./controllers/topicController");
// const {geminiapi , getTest, getDetails } = require("./geminiapi")

const app = express.Router();
app.post("/add", fetchSubtopics );
// app.post("/test" , getTest);
// app.post("/learn" , getDetails);
module.exports = app;