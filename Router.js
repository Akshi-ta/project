const express = require("express");
const { fetchSubtopics } = require("./controllers/topicController");
const { getTest, getTestChat } = require("./controllers/testController");
// const {geminiapi , getTest, getDetails } = require("./geminiapi")

const app = express.Router();
app.post("/add", fetchSubtopics );
app.post("/test" , getTest);
app.post("/test/chat", getTestChat);
// app.post("/learn" , getDetails);
module.exports = app;