const mongoose = require("mongoose");

function getProductModel() {
    let signupSchema = mongoose.Schema(
        {
            email: { type: String, unique: true, required: true, index: true },
            password: String,
            utype: String
        },
        {
            versionKey: false,
        }
    )

    // subtopic: [
    //     {
    //     "learn"
    //     "test" : [{
    //         "test number":Number,
    //         "Questions": [{
    //             "Questions Number": Number,
    //             "Question" :String,
    //             "Options":[{
    //                 "Option Number": Number,
    //                 "Option" :String,
    //                 }]
    //             "Correct Option":Number
    //             "Selected Option":Number
    //             }]
    //         "Conversation":[{
    //             "role":String,
    //             "message":String
    //             }]
    //         }]
    //     }]

    
    const conversationSchema = mongoose.Schema({
        "role":String,
        "message":String
    })

    const optionSchema = mongoose.Schema({
        "Option Number": Number,
        "Option" :String,
    })

    const questionSchema = mongoose.Schema({
        "Questions Number": Number,
        "Question" :String,
        "Options":[optionSchema],
        "Correct Option":Number,
        "Selected Option":Number
    })

    const testSchema =mongoose.Schema({
        "test number":Number,
        "Questions": [questionSchema],
        "Conversation":[conversationSchema]
    })

    const subtopicSchema = mongoose.Schema({
        'subtopic number': Number,
        'subtopic name': String,
        duration: String,
        'learn':[],
        'test':[testSchema]
    },
    {
        versionKey: false,
    });

    // Define the schema for the main document
    const topicSchema = mongoose.Schema({
        email: String,
        topics: [
            {
                topic: String,
                subtopic: [subtopicSchema]
            }

        ],
    },
        {
            versionKey: false,
        }
    );

    // let topicSchema = mongoose.Schema(
    //     {
    //         email: String,
    //         topic: String,
    //         subtopics: 
    //         [
    //             {
    //                 'subtopic number': Number,
    //                 'subtopic name': String,
    //                 duration: String
    //             }
    //         ]
    //     },
    //     {
    //         versionKey: false,
    //     }
    // )


    const SignupInfo = mongoose.model("SignupInfo", signupSchema);
    const SubTopicList = mongoose.model("topics", topicSchema);
    return { SignupInfo, SubTopicList };
}
module.exports = { getProductModel }



