const mongoose = require("mongoose");

const questionSchema = mongoose.Schema({
    "question number": { type: Number },
    "Question": { type: String },
    "options": [{
        "Option Number": { type: Number },
        "Option": { type: String },
    }],
    "correct option": { type: Number },
    "Selected Option": { type: Number }
})
 
module.exports = mongoose.model('Question', questionSchema)