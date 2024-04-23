const mongoose = require("mongoose");
const Option = require("./option");

const questionSchema = mongoose.Schema({
    "question number": {type:Number},
    "Question": {type:String},
    "options": [{type: Option.schema}],
    "correct cption": {type:Number},
    "Selected Option": {type:Number}
})
 
module.exports = mongoose.model('Question' , questionSchema )