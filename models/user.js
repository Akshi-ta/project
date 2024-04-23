const mongoose = require("mongoose");
const userSchema = mongoose.Schema({
    email : {
        type: String,
        required: true
    },
    topics:[{
        type: mongoose.Schema.Types.ObjectId,
        ref:'Topic'
    }]
},
    {
        versionKey: false,
    }
);

module.exports = mongoose.model('User', userSchema)