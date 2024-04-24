const express = require("express");
const { fetchSubtopics , getSubtopics} = require("./controllers/topicController");
const { getTest, getTestChat } = require("./controllers/testController");

// const { getDetails } = require("./controllers/learnController");
const {doSignup , doLogin}  = require("./controllers/signupController");

const { getDetails, getLearnChat } = require("./controllers/learnController");

// const {geminiapi , getTest, getDetails } = require("./geminiapi")

const app = express.Router();
app.post("/add", fetchSubtopics );
app.post("/getSubtopics" , getSubtopics);
app.post("/test" , getTest);
app.post("/test/chat", getTestChat);
app.post("/learn" , getDetails);

app.post("/signup" ,doSignup); 
app.post("/dologin", doLogin);

app.post("/learn/chat" , getLearnChat);
module.exports = app;