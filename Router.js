const express = require("express");
const { fetchSubtopics } = require("./controllers/topicController");
const { getTest, getTestChat } = require("./controllers/testController");
const { getDetails, getLearnChat } = require("./controllers/learnController");
// const {geminiapi , getTest, getDetails } = require("./geminiapi")

const app = express.Router();
app.post("/add", fetchSubtopics );
app.post("/test" , getTest);
app.post("/test/chat", getTestChat);
app.post("/learn" , getDetails);
app.post("/learn/chat" , getLearnChat);
module.exports = app;