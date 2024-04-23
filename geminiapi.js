const { getProductModel } = require("./models/ModelProduct");
const { SubTopicList } = getProductModel();
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
        console.log(text);
        const jsontext = JSON.parse(text);
        console.log(jsontext);
        const existingInfo = await SubTopicList.findOne({ email: req.body.email });
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



// async function insertQuestionsIntoSubtopic(email, topic, subtopic, questions, resp) {
//     try {
//         const result = await SubTopicList.find({ email: email });
//         const [{ topics: topicsArray }] = result;
//         console.log(topicsArray);
//         const foundTopic = topicsArray.find(topicObj => topicObj.topic === topic);
//         if (foundTopic) {
//             const foundSubtopic = foundTopic.subtopic;
//             const ans = foundSubtopic.find(subtopicObj => subtopicObj['subtopic name'] === subtopic);
//             if (ans) {
//                 ans.test.push({
//                     'test number': ans.test.length + 1,
//                     Questions: questions
//                 });
//                 await ans.save(); // Wait for the save operation to complete
//                 return result;
//             }
//         } else {
//             console.log("Topic not found");
//         }
//     } catch (err) {
//         console.log(err);
//     }
// }

async function insertQuestionsIntoSubtopic(email, topic, subtopic, questions, resp) {
    try {
        const result = await SubTopicList.findOne({ email: email });
        if (result) {
            const { topics } = result;
            const foundTopic = topics.find(topicObj => topicObj.topic === topic);
            if (foundTopic) {
                const foundSubtopic = foundTopic.subtopic.find(subtopicObj => subtopicObj['subtopic name'] === subtopic);
                if (foundSubtopic) {
                    foundSubtopic.test.push({
                        'test number': foundSubtopic.test.length + 1,
                        Questions: questions
                    });
                    await result.save(); // Save the updated SubTopicList document
                    return result;
                }
            } else {
                console.log("Topic not found");
            }
        } else {
            console.log("Email not found");
        }
    } catch (err) {
        console.log(err);
    }
}






async function getTest(req, resp) {
    try {
        const email = req.body.email;
        const topic = req.body.topic;
        const subtopic = req.body.subtopic;
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });
        const prompt = `i will give you the subtopic as input and you have to provide the test of 5 MCQs for each subtopic. Output must be of the form {"subtopic":"subtopicname" , "Questions" : [{"question number" : "question number" , "Question" : "Question" , "options":["a", "b", "c", "d"] , "correct option" : "correct option"}]}
        input: topic =  ${topic} , subtopic = ${subtopic}`;
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        const ans = await insertQuestionsIntoSubtopic(email, topic, subtopic, text.questions);
        console.log(ans);
        resp.set("json");
        resp.json({ status: true, rec: ans, out: "yay" });

    } catch (error) {
        console.error("Error:", error);
        resp.status(500).json({ error: "An error occurred" });
    }
}

async function getDetails(req, resp) {
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
        resp.json({ response: text, status: true });

    } catch (error) {
        console.error("Error:", error);
        resp.status(500).json({ error: "An error occurred" });
    }
}

module.exports = { geminiapi, getTest, getDetails }