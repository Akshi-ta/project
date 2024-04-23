const Topic = require("../models/topic");
const Subtopic = require("../models/subtopic");
const Test = require("../models/test");
const Question = require("../models/questions");
const Option = require("../models/option");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const dotenv = require("dotenv");
dotenv.config();
const genAI = new GoogleGenerativeAI(process.env.API_KEY);

async function insertTestIntoSubtopic(subtopicID, questions) {
    try {
        //find subtopic by subtopicId
        const subtopic = await Subtopic.findById(subtopicID);
        if (!subtopic) {
            return { status: false, rec: null, out: "Subtopic not found" };
        }
        //create questions
        const questionArray = [];
        for (let i = 0; i < questions.length; i++) {
            let options = [];
            for(let i=0;i<questions[i].options.length;i++){
                const option = new Option({
                    "Option Number": i+1,
                    "Option": questions[i].options[i]
                });
                options.push(option);
            }
            const question = new Question({
                "question number": i + 1,
                "Question": questions[i].Question,
                "options": options,
                "correct option": questions[i]["correct option"]
            });
            const savedQuestion = await question.save();
            questionArray.push(savedQuestion._id);
        }
        //create test
        const test = new Test({
            "test number": subtopic.test.length+1,
            "Questions": questionArray
        });
        const savedTest = await test.save();
        //add test to subtopic
        subtopic.test.push(savedTest._id);
        const updatedSubtopic = await subtopic.save();
        return { status: true, rec: updatedSubtopic, out: "Test added successfully" };
    } catch (err) {
        console.log(err);
    }
}




async function getTest(req, resp) {
    try {
        const topicName = req.body.topicName;
        const subtopicName = req.body.subtopicName;
        const subtopic = req.body.subtopic;
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });
        const prompt = `i will give you the subtopic as input and you have to provide the test of 5 MCQs for each subtopic. Output must be of the form {"subtopic":"subtopicname" , "Questions" : [{"question number" : "question number" , "Question" : "Question" , "options":[{"Option number":1, "Option":"a"}] , "correct option" : "correct option"}]}
        input: topic =  ${topicName} , subtopic = ${subtopicName}`;
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        console.log(text);
        const parsedText = JSON.parse(text);
        const questions = parsedText.Questions;
        console.log(questions);
        const ans = await insertTestIntoSubtopic(subtopic, questions);
        // console.log(ans);
        resp.set("json");
        resp.json({ status: true, rec: ans, out: "yay" });

    } catch (error) {
        console.error("Error:", error);
        resp.status(500).json({ error: "An error occurred" });
    }
}



module.exports = { getTest }