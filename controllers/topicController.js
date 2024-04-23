const User = require("../models/user")
const { GoogleGenerativeAI } = require("@google/generative-ai");
const dotenv = require("dotenv");
dotenv.config();
const genAI = new GoogleGenerativeAI(process.env.API_KEY);


async function fetchSubtopics(req, resp) {
    console.log(req.body.topic);
    try {
        const topic = req.body.topic;
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });
        const prompt = `i will provide you a input from user which is the topic he want to learn from you. i want you to break that topic into smaller topics whose order will be from basic and easiest to advanced and hard, also give the average time taken by the student to learn that topic. output must be in the form of {"topic":"topic_name",  "subtopics":[ {"subtopic number" : "subtopic number" , "subtopic name" : "subtopic name"  , "duration":"duration"} ]} , input = ${JSON.stringify(topic)}`;
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        console.log(text);
        const jsontext = JSON.parse(text);
        console.log(jsontext);
        const existingInfo = User.findOne({ email: req.body.email });
        console.log(existingInfo);
        if (existingInfo) {
            existingInfo.topics.push({
                topic: req.body.topic,
                subtopic: jsontext.subtopics
            });
            await existingInfo.save();
            resp.set("json");
            resp.json({ status: true, rec: existingInfo, out: "yay" });
        }
        else {
            const obj = {
                "email": req.body.email,
                "topics": [{
                    "topic": req.body.topic,
                    "subtopic": jsontext.subtopics
                }],
            }
            console.log(obj);
            const info = new SubTopicList(obj);
            info.save().then((ans) => {
                console.log(ans);
                resp.set("json");
                resp.json({ status: true, rec: ans, out: "yay" });
            })
        }

    } catch (error) {
        console.error("Error:", error);
        resp.status(500).json({ error: "An error occurred", status: false });
    }
}

module.exports = { fetchSubtopics }