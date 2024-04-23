

// async function insertQuestionsIntoTest(foundSubtopic, questions) {
//     console.log(questions);
    

// }

// async function insertTestIntoSubtopic(email, topic, subtopic, questions) {
//     try {
//         const result = await SubTopicList.findOne({ email: email });
//         if (result) {
//             const { topics } = result;
//             const foundTopic = topics.find(topicObj => topicObj.topic === topic);
//             if (foundTopic) {
//                 const foundSubtopic = foundTopic.subtopic.find(subtopicObj => subtopicObj['subtopic name'] === subtopic);
//                 if (foundSubtopic) {
//                     const obj = insertQuestionsIntoTest(foundSubtopic, questions)
//                     // foundSubtopic.test.push({
//                     //     'test number': foundSubtopic.test.length + 1,
//                     //     Questions: questions
//                     // });
//                     // foundSubtopic.test.push(obj);
//                     // await result.save();
//                     // return result;
//                 }
//             } else {
//                 console.log("Topic not found");
//             }
//         } else {
//             console.log("Email not found");
//         }
//     } catch (err) {
//         console.log(err);
//     }
// }




// async function getTest(req, resp) {
//     try {
//         const email = req.body.email;
//         const topic = req.body.topic;
//         const subtopic = req.body.subtopic;
//         const model = genAI.getGenerativeModel({ model: "gemini-pro" });
//         const prompt = `i will give you the subtopic as input and you have to provide the test of 5 MCQs for each subtopic. Output must be of the form {"subtopic":"subtopicname" , "Questions" : [{"question number" : "question number" , "Question" : "Question" , "options":["a", "b", "c", "d"] , "correct option" : "correct option"}]}
//         input: topic =  ${topic} , subtopic = ${subtopic}`;
//         const result = await model.generateContent(prompt);
//         const response = await result.response;
//         const text = response.text();
//         console.log(text);
//         const parsedText = JSON.parse(text);
//         const questions = parsedText.Questions;
//         // console.log(questions);
//         const ans = await insertTestIntoSubtopic(email, topic, subtopic, questions);
//         // console.log(ans);
//         resp.set("json");
//         resp.json({ status: true, rec: ans, out: "yay" });

//     } catch (error) {
//         console.error("Error:", error);
//         resp.status(500).json({ error: "An error occurred" });
//     }
// }



// module.exports = { geminiapi, getTest, getDetails }