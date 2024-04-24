//get subtopic , topic , subtopic id 
// learn -> id ? history
const Topic = require("../models/topic");
const Subtopic = require("../models/subtopic");
const Test = require("../models/test");
const Question = require("../models/questions");
const Option = require("../models/option");
const History = require("../models/history");
const Learn = require("../models/learn")
const { GoogleGenerativeAI } = require("@google/generative-ai");
const dotenv = require("dotenv");

dotenv.config();
const genAI = new GoogleGenerativeAI(process.env.API_KEY);

async function insertTextIntoLearn(subtopicID, message, topicName, subtopicName) {
    try {
        const subtopic = await Subtopic.findById(subtopicID);
        if (!subtopic) {
            return { status: false, rec: null, out: "Subtopic not found" };
        }
        const learnId = subtopic.learn.chat;
        console.log(learnId);
        const history = await History.findById(learnId);
        var chatHistory = [];

        if (!history.history.length) {
            chatHistory = [
                {
                    role: "user",
                    parts: [{ text: `Below is the explanation for the topic ${topicName} and subtopic ${subtopicName} you gave. you are a online tutor and now you are required to answer the questions of a student who might have read this explanation but still doesn't fully undersntand it. you are required to judge the students understanding level and answer accordingly. Explanation: ${subtopic.learn.explanation}` }]
                },
                {
                    role: "model",
                    parts: [{ text: "Thanks for providing the explanation" },]
                }
            ];
        } else {
            chatHistory = history.history;
        }

        const model = genAI.getGenerativeModel({ model: "gemini-pro" });
        const chat = model.startChat({
            history: chatHistory,
        });
        const result = await chat.sendMessage(message);
        const response = await result.response;
        const text = response.text();
        history.history = await chat.getHistory();
        await history.save();
        return text;
    } catch (error) {
        console.error("Error:", error);
        // resp.status(500).json({ error: "An error occurred" });
    }
}


async function getDetails(req, resp) {
    try {
        const topicName = req.body.topicName;
        const subtopicName = req.body.subtopicName;
        const subtopicId = req.body.subtopicId;

        const subtopic = await Subtopic.findById(subtopicId);

        if (subtopic.learn.explanation !== "") {
            const history = await History.findById(subtopic.learn.chat);
            console.log(history.history);
            resp.json({ 
                status: true, 
                response: { 
                    explanation: subtopic.learn.explanation,
                    history: history.history
                }
            });
        } else {
            const model = genAI.getGenerativeModel({ model: "gemini-pro" });
            const prompt = `give the detailed explanation using diagrams and everything to explain the given input in the good presented and detailed way like you are teaching to someone who have no idea of the given topic, output must not contain any letter which cannot be parsed by JSON.parse
        input: topic =  ${topicName} , subtopic = ${subtopicName}`;
            const result = await model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();
            subtopic.learn.explanation = text;
            await subtopic.save();
            resp.json({ status: true, response: { explanation: text, history: [] } });
        }
    } catch (error) {
        console.error("Error:", error);
        resp.status(500).json({ error: "An error occurred" });
    }
}

async function getLearnChat(req, resp) {
    const message = req.body.message;
    const subtopicId = req.body.subtopicId;
    const subtopicName = req.body.subtopicName;
    const topicName = req.body.topicName;
    var response = await insertTextIntoLearn(subtopicId, message, topicName, subtopicName);
    resp.json({ status: true, response: response });
}


module.exports = { getDetails, getLearnChat }