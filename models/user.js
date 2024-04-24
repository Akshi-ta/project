const mongoose = require("mongoose");
const userSchema = mongoose.Schema({
    email: { type: String, unique: true, required: true, index: true },
    topics: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Topic'
    }],
    password: { type: String }
},
    {
        versionKey: false,
    }
);

module.exports = mongoose.model('User', userSchema)