const express = require("express");
const { fetchSubtopics , getSubtopics} = require("./controllers/topicController");
const { addTest, getTestChat, getTest, saveSelectedOptionsToTest } = require("./controllers/testController");

// const { getDetails } = require("./controllers/learnController");
const {doSignup , doLogin, getUser}  = require("./controllers/signupController");

const { getDetails, getLearnChat } = require("./controllers/learnController");


const app = express.Router();
app.post("/add", fetchSubtopics );

app.post("/test/new" , addTest);
app.get("/test/:subtopicId", getTest);
app.post("/getSubtopics" , getSubtopics);
app.post("/test/chat", getTestChat);
app.post("/test/save", saveSelectedOptionsToTest);

app.post("/learn" , getDetails);
app.post("/learn/chat" , getLearnChat);

app.post("/signup" ,doSignup); 
app.post("/dologin", doLogin);

app.get("/getUser/:email", getUser)

module.exports = app;