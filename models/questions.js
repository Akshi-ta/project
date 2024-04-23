const mongoose = require("mongoose");

const optionSchema = mongoose.Schema({
    "Option Number": Number,
    "Option": String,
})

const questionSchema = mongoose.Schema({
    "question number": {type:Number},
    "Question": {type:String},
    "options": [optionSchema],
    "correct cption": {type:Number},
    "Selected Option": {type:Number}
})

module.exports = mongoose.model('Question' , questionSchema )