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

async function insertTextIntoLearn(subtopicID, jsonstring) {
    try {
        const subtopic = await Subtopic.findById(subtopicID);
        if (!subtopic) {
            return { status: false, rec: null, out: "Subtopic not found" };
        }
        const learnId = subtopic.learn;
        console.log(learnId);
        const history = await History.findById(learnId);
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });
        var chatHistory = [];
        if (!history.history.length) {
            chatHistory = [
                {
                    role: "user",
                    parts: [{ text: `this JSON contains the theory of a topic ${jsonstring}` }]
                },
                {
                    role: "model",
                    parts: [{ text: "Thanks for providing the theory" },]
                }
            ];
            // console.log(history.history[0].parts[0]);
        } else {
            chatHistory = history.history;
        }
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
        const subtopic = req.body.subtopic;
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });
        const prompt = `give the detailed explanation using diagrams and everything to explain the given input in the good presented and detailed way like you are teaching to someone who have no idea of the given topic, output must not contain any letter which cannot be parsed by JSON.parse
        input: topic =  ${topicName} , subtopic = ${subtopicName}`;
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        console.log(JSON.stringify(text));
        const ans = await insertTextIntoLearn(subtopic, JSON.stringify(text));
        // // console.log(ans);
        // resp.set("json");
        // resp.json({ status: true, rec: ans, out: "yay" });

    } catch (error) {
        console.error("Error:", error);
        resp.status(500).json({ error: "An error occurred" });
    }
}

async function getLearnChat(req, resp) {
    const message  = req.body.message;
    const subtopicId = req.body.subtopicId;
    insertTextIntoLearn(subtopicId , message);
}


module.exports = { getDetails , getLearnChat }