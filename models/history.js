const mongoose = require("mongoose");

const partSchema = mongoose.Schema({
    text: { type: String }
}, { _id: false });

const objectSchema = mongoose.Schema({
    role: { type: String },
    parts: [partSchema]
}, { _id: false });

const historySchema = mongoose.Schema({
    history: [objectSchema]
}, { versionKey: false });

module.exports = mongoose.model('History', historySchema);
