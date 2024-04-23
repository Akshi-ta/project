const mongoose = require("mongoose");

const optionSchema = mongoose.Schema()
 
module.exports = mongoose.model('Option', optionSchema)