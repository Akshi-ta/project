const User = require("../models/user")
const Topic = require("../models/topic")
const Subtopic = require("../models/subtopic")
const { GoogleGenerativeAI } = require("@google/generative-ai");
const dotenv = require("dotenv");
const subtopic = require("../models/subtopic");
const History = require("../models/history")
dotenv.config();
const genAI = new GoogleGenerativeAI(process.env.API_KEY);


async function getUser(email) {
    var user = await User.findOne({ email: email });
    const list = [];
    for(let i=0; i<user.topics.length; i++){
        const subTopicList = [];
        var topic = await Topic.findById(user.topics[i]._id);
        for(var j=0; j<topic.subtopic.length; j++){
            var subTopic = await Subtopic.findById(topic.subtopic[j]._id);
            subTopicList.push(subTopic);
        }
        list.push({
            topic: topic.topic,
            subtopic: subTopicList
        });
    }
    return{ 
        status: true, 
        out: {
            email: user.email,
            topics: list
        } 
    };
}


async function fetchSubtopics(req, resp) {
    try {
        const topic = req.body.topic;
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });
        const prompt = `i will provide you a input from user which is the topic he want to learn from you. i want you to break that topic into smaller topics whose order will be from basic and easiest to advanced and hard, also give the average time taken by the student to learn that topic. output must be in the form of {"topic":"topic_name",  "subtopics":[ {"subtopic number" : "subtopic number" , "subtopic name" : "subtopic name"  , "duration":"duration"} ]} ensure that the response doesn't contain any character that make the response invalid json. valid json only , input = ${JSON.stringify(topic)}`;
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        const jsontext = JSON.parse(text);
        const existingInfo = await User.findOne({ email: req.body.email });
        let list = [];
        let listToPass = [];
        for (let i = 0; i < jsontext.subtopics.length; i++) {
            const history = new History({
                "history": []
            });
            const savedHistory = await history.save();
            const newSubTopic = new Subtopic({
                'subtopic number': jsontext.subtopics[i]["subtopic number"],
                'subtopic name': jsontext.subtopics[i]["subtopic name"],
                duration: jsontext.subtopics[i]["duration"],
                learn: {
                    explanation: "",
                    chat: savedHistory._id
                }
            });
            await newSubTopic.save();
            list.push(newSubTopic._id);
            listToPass.push({
                id: newSubTopic._id,
                "subtopic number": jsontext.subtopics[i]["subtopic number"],
                "subtopic name": jsontext.subtopics[i]["subtopic name"],
                duration: jsontext.subtopics[i]["duration"]
            });

        }

        const newTopic = new Topic({
            topic: topic,
            subtopic: list,
        });
        await newTopic.save();
        if (existingInfo) {
            let topicList = existingInfo.topics;
            topicList.push(newTopic._id);
            existingInfo.topics = topicList;
            await existingInfo.save();
            resp.json({ status: true, subtopics: listToPass , user: (await getUser(req.body.email)), topicId:newTopic._id});
        }
        else {
            let newUser = User({
                email: req.body.email,
                topics: [newTopic._id]
            });
            await newUser.save();
            
            resp.json({ status: true, subtopics: listToPass, user: (await getUser(req.body.email)),  topicId:newTopic._id });
        }

    } catch (error) {
        console.error("Error:", error);
        resp.status(500).json({ error: "An error occurred", status: false });
    }
}


async function getSubtopics(req, resp) {
    const topicId = req.body.topicId;
    const Findtopic = await Topic.findById(topicId);
    if (!Findtopic) {
        return { status: false, rec: null, out: "topic not found" };
    }
    const topicName = Findtopic;
    try {
        const topic = await Topic.findById(topicId).populate('subtopic');
        resp.json({status:true , out:topic.subtopic , topicName: Findtopic.topic  })
    } catch (err) {
        console.log("Error");
        // console.error(err);
    }
    // console.log(topic);


}

module.exports = { fetchSubtopics, getSubtopics }