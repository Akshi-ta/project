const express = require("express");
const { fetchSubtopics } = require("./controllers/topicController");
const { addTest, getTestChat, getTest, saveSelectedOptionsToTest } = require("./controllers/testController");
const { getDetails, getLearnChat } = require("./controllers/learnController");
// const {geminiapi , getTest, getDetails } = require("./geminiapi")

const app = express.Router();
app.post("/add", fetchSubtopics );

app.post("/test/new" , addTest);
app.get("/test/:subtopicId", getTest);
app.post("/test/chat", getTestChat);
app.post("/test/save", saveSelectedOptionsToTest);

app.post("/learn" , getDetails);
app.post("/learn/chat" , getLearnChat);
module.exports = app;