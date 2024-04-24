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
                console.log(questions[i]);
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
        const prompt = `i will give you the subtopic as input and you have to provide the test of 5 MCQs for each subtopic. Output must be of the form {"subtopic":"subtopicname" , "Questions" : [{"question number" : "question number" , "Question" : "Question" , "options":[{"Option number":1, "Option":"a"}] , "correct option" : correct_option_number}]}
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
        resp.json({ status: true, response: ans, out: "yay" });

    } catch (error) {
        console.error("Error:", error);
        resp.status(500).json({ error: "An error occurred" });
    }
}

// function removeIdField(history) {
//     var list = [];
//     for(let i=0; history.length; i++){
//         console.log(history[i]);
//         list.push({
//             role: history[i].role,
//             parts: history[i].parts
//         });
//     }
//     return list;
// }

async function getTestChat(req, resp) {
    try {
        const testId = req.body.testId;
        const message = req.body.message;
        const test = await Test.findById(testId);

        //1. get history of that test conversation
        const historyId = test.Conversation;
        console.log(historyId);
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

        // console.log(chatHistory);


        const chat = model.startChat({
            history: chatHistory,
        });
        const result = await chat.sendMessage(message);
        const response = await result.response;
        const text = response.text();

        history.history = await chat.getHistory();
        await history.save();
        

        resp.json({ status: true, out: text })



        // const msg = `Above is the chat history between you, the online tutor, and a student. The user has given a test whose details are provided in the history's first message from the user. you are required to give a friendly answer to the student. judge from the above chat the understanding level of the student and provide a suitable answer. The student has asked you the following question: ${message}`;
        // const msg =

        //2. give to gemini -> add the message to the history
        //3. save the history
        //4. return the response
    } catch (error) {
        console.error("Error:", error);
        resp.status(500).json({ error: "An error occurred" });
    }
}


module.exports = { getTest, getTestChat }