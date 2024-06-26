const { GoogleGenerativeAI } = require("@google/generative-ai");
const dotenv = require("dotenv");
dotenv.config();
const genAI = new GoogleGenerativeAI(process.env.API_KEY);


async function geminiapi(req, resp) {
    console.log(req.body.topic);
    try {
        const topic = req.body.topic;
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });
        const prompt = `i will provide you a input from user which is the topic he want to learn from you. i want you to break that topic into smaller topics whose order will be from basic and easiest to advanced and hard, also give the average time taken by the student to learn that topic. output must be in the form of {"topic":"topic_name",  "subtopics":[ {"subtopic number" : "subtopic number" , "subtopic name" : "subtopic name"  , "duration":"duration"} ]} , input = ${JSON.stringify(topic)}`;
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        const jsontext = JSON.parse(text);
        console.log(jsontext);
        resp.set("json");
        resp.json({ response: text , status: true});
        
    } catch (error) {
        console.error("Error:", error);
        resp.status(500).json({ error: "An error occurred" ,  status: false });
    }
}

async function getTest(req , resp)
{
    try {
        const topic = req.body.topic;
        const subtopic = req.body.subtopic;
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });
        const prompt = `i will give you the subtopic as input and you have to provide the test of 5 MCQs for each subtopic. Output must be of the form {"subtopic":"subtopicname" , "Questions" : [{"question number" : "question number" , "Question" : "Question" , "options":["a", "b", "c", "d"] , "correct option" : "correct option"}]}
        input: topic =  ${topic} , subtopic = ${subtopic}`;
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        resp.set("json");
        resp.json({ response: text , status: true});
        
    } catch (error) {
        console.error("Error:", error);
        resp.status(500).json({ error: "An error occurred" });
    }
}

async function getDetails(req , resp)
{
    console.log(req.body);
    try {
        const topic = req.body.topic;
        const subtopic = req.body.subtopic;
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });
        const prompt = `give the detailed explanation using diagrams and everything to explain the given input in the good presented and detailed way like you are teaching to someone who have no idea of the given topic
        input: topic =  ${topic} , subtopic = ${subtopic}`;
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        resp.set("json");
        resp.json({ response: text , status: true});
        
    } catch (error) {
        console.error("Error:", error);
        resp.status(500).json({ error: "An error occurred" });
    }
}

module.exports = { geminiapi , getTest , getDetails }