const mongoose = require("mongoose");
const subtopicSchema = mongoose.Schema({
    'subtopic number': { type: Number },
    'subtopic name': { type: String },
    'duration': { type: String },
    'learn': {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'History'
    },
    'test': [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Test'
    }]
},
    {
        versionKey: false,
    }
);

module.exports = mongoose.model('Subtopic', subtopicSchema)