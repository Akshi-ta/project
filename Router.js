const express = require("express");
const {geminiapi , getTest, getDetails } = require("./geminiapi")
const app = express.Router();
app.post("/add", geminiapi );    //IP: topic name -> OP: subtopics
app.post("/test" , getTest);     //IP: topic name, subtopic name -> OP: MCQs
app.post("/learn" , getDetails); //IP: topic name, subtopic name -> OP: detailed explanation
module.exports = app;