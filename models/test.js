const mongoose = require("mongoose");
const testSchema = mongoose.Schema({

    "test number": {type:Number},
    "Questions": [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Question'
    }],
    
    "Conversation": {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'History'
        }
},
{
    versionKey: false,
});

module.exports = mongoose.model('Test', testSchema)
