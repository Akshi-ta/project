const mongoose = require("mongoose");

const optionSchema = mongoose.Schema({
    "Option Number": Number,
    "Option": String,
})
 
module.exports = mongoose.model('Option', optionSchema)