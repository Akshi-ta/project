const Topic = require("../models/topic");
const Subtopic = require("../models/subtopic");
const Test = require("../models/test");
const Question = require("../models/questions");
const Option = require("../models/option");
const History = require("../models/history");
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
            for (let i = 0; i < questions[i].options.length; i++) {
                // console.log(questions[i]);
                const option = {
                    "Option Number": i + 1,
                    "Option": questions[i].options[i].Option
                };
                options.push(option);
            }
            // console.log(options);
            const question = new Question({
                "question number": i + 1,
                "Question": questions[i].Question,
                "options": options,
                "correct option": questions[i]["correct option"]
            });
            const savedQuestion = await question.save();
            questionArray.push(savedQuestion._id);
        }
        //create History
        const history = new History({
            "history": []
        });
        const savedHistory = await history.save();
        //create test
        const test = new Test({
            "test number": subtopic.test.length + 1,
            "Questions": questionArray,
            "Conversation": savedHistory._id
        });
        const savedTest = await test.save();
        //add test to subtopic
        subtopic.test.push(savedTest._id);
        await subtopic.save();
        return { status: true, response: savedTest, testId:savedTest._id , out: "Test added successfully" };
    } catch (err) {
        console.log(err);
    }
}

async function addTest(req, resp) {
    try {
        const topicName = req.body.topicName;
        const subtopicName = req.body.subtopicName;
        const subtopic = req.body.subtopic;
        // console.log(subtopic);
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });
        const prompt = `i will give you the subtopic as input and you have to provide the test of 5 MCQs for each subtopic. Output must be of the form {"subtopic":"subtopicname" , "Questions" : [{"question number" : "question number" , "Question" : "Question" , "options":[{"Option number":1, "Option":"a"}] , "correct option" : correct_option_number}]}
        input: topic =  ${topicName} , subtopic = ${subtopicName}`;
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        // console.log(text);
        const parsedText = JSON.parse(text);
        const questions = parsedText.Questions;
        console.log(questions);
        const ans = await insertTestIntoSubtopic(subtopic, questions);
        // console.log(ans);
        resp.set("json");
        resp.json({ status: true, response: ans, questions:questions , out: "yay" });

    } catch (error) {
        console.error("Error:", error);
        resp.status(500).json({ error: "An error occurred" });
    }
}


async function getTestChat(req, resp) {
    try {
        const testId = req.body.testId;
        const message = req.body.message;
        const test = await Test.findById(testId);
        console.log(test);

        //1. get history of that test conversation
        const historyId = test.Conversation;
        const history = await History.findById(historyId);
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });

        var chatHistory = [];

        if (!history.history.length) {
            const questionsList = [];
            for (let i = 0; i < test.Questions.length; i++) {
                const question = await Question.findById(test.Questions[i]);
                questionsList.push(question);
            }
            // console.log(JSON.stringify(questionsList));
            chatHistory = [
                {
                    role: "user",
                    parts: [{ text: `this JSON contains the questions of a test and the respective selected options that I marked ${JSON.stringify(questionsList)}` }]
                }, 
                { 
                    role: "model", 
                    parts: [{ text: "Thanks for providing the questions" } ,] 
                }
            ];
            // console.log(history.history[0].parts[0]);
        }else{
            chatHistory = history.history;
        }


        const chat = model.startChat({
            history: chatHistory,
        });
        const msg = `Above is the chat history between you, the online tutor, and a student. The user has given a test whose details are provided in the history's first message from the user. you are required to give a friendly answer to the student. judge from the above chat the understanding level of the student and provide a suitable answer. The student has asked you the following question: ${message}`;
        const result = await chat.sendMessage(msg);
        const response = result.response;
        const text = response.text();

        history.history = await chat.getHistory();
        await history.save();


        resp.json({ status: true, out: text })
    } catch (error) {
        console.error("Error:", error);
        resp.status(500).json({ error: "An error occurred" });
    }
}

async function getTest(req, resp) {
    try {
        const subtopicId = req.params.subtopicId;
        const subtopic = await Subtopic.findById(subtopicId);
        if (!subtopic) {
            resp.json({ status: false, out: "Subtopic not found" });
        }
        const list = [];
        for(var i=0; i<subtopic.test.length; i++){
            var test = await Test.findById(subtopic.test[i]._id)
            var questionsList = [];

            for(var j=0; j<test.Questions.length; j++){
                var question = await Question.findById(test.Questions[j]);
                questionsList.push(question);
            }
            list.push({
                "_id": test._id,
                "test number": test["test number"],
                "Questions": questionsList,
                "Conversation": test.Conversation
            });
        }
        resp.json({ status: true, rec: {
            'subtopic number': subtopic["subtopic number"],
            'subtopic name': subtopic["subtopic name"],
            'duration': subtopic.duration,
            'learn': {
                explanation: subtopic.learn.explanation,
                chat:subtopic.learn.chat
            },
            'test': list
        }, out: "yay" });
    } catch (error) {
        console.error("Error:", error);
        resp.status(500).json({ error: "An error occurred" });
    }

}

async function saveSelectedOptionsToTest(req, resp) {
    try {
        const testId = req.body.testId;
        console.log(req.body.answers);
        const answers = req.body.answers;
        const test = await Test.findById(testId);
        if (!test) {
            resp.json({ status: false, out: "Test not found" });
        }
        for(let i=0; i<test.Questions.length; i++){
            const question = await Question.findById(test.Questions[i]);
            question["Selected Option"] = answers[i+1];
            await question.save();
        }
        // for (let i = 0; i < answers.length; i++) {
        //     const question = await Question.findById(test.Questions[i]._id);
        //     question["Selected Option"] = answers[i][i];
        //     await question.save();
        //     console.log(question["Selected Option"]);
        // }
        resp.json({ status: true, out: "Selected options saved successfully" });

    } catch (error) {
        console.error("Error:", error);
        resp.status(500).json({ error: "An error occurred" });
    }

}

module.exports = { addTest, getTestChat, getTest, saveSelectedOptionsToTest }