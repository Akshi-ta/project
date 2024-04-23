const mongoose = require("mongoose");
const topicSchema = mongoose.Schema({
    topic: {
        type: String
    },
    subtopic: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Subtopic'
    }]
},
    {
        versionKey: false,
    }
);

module.exports = mongoose.model('Topic', topicSchema)