const mongoose = require("mongoose");

const partSchema = mongoose.Schema({
    text: { type: String }
}, { _id: false });

const objectSchema = mongoose.Schema({
    role: { type: String },
    parts: [partSchema]
}, { _id: false });

const learnSchema = mongoose.Schema({
    learn: [objectSchema]
}, { versionKey: false });

module.exports = mongoose.model('Learn', learnSchema);
