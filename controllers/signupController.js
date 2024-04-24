const User = require("../models/user");
const Topic = require("../models/topic");
const Subtopic = require("../models/subtopic");

async function doSignup(req, resp) {
    var user = await User.findOne({ email: req.body.email });
    if(user){
        console.log(user);
        return resp.json({status: false, rec: null, out: "user already exists"})
    }
    const info = new User(req.body);
    info.save().then((ans) => {
        // resp.send(ans);
        resp.json({ status: true, rec: ans, out: "yay" });
    }).catch((err) => {
        console.log(err.message);
        // resp.send(err.message);
    })
}

function doLogin(req, resp) {
    User.find({ email: req.body.email }).then((result) => {
        if (result[0].password === req.body.password) {
            resp.json({ status: true, res: "password matches", type: result[0].utype});
        }
        else {
            resp.json({ status: false, res: "password doesn't match" });
        }
    }).catch(function (err) {
        resp.json({ status: false, res: err.message });
    })
}

async function getUser(req, resp) {
    const email = req.params.email;
    var user = await User.findOne({ email: email });
    const list = [];
    for(let i=0; i<user.topics.length; i++){
        const subTopicList = [];
        var topic = await Topic.findById(user.topics[i]._id);
        for(var j=0; j<topic.subtopic.length; j++){
            var subTopic = await Subtopic.findById(topic.subtopic[j]._id);
            subTopicList.push(subTopic);
        }
        list.push({
            topic: topic.topic,
            subtopic: subTopicList
        });
    }
    resp.json({ 
        status: true, 
        out: {
            email: user.email,
            topics: list
        } 
    });
}

module.exports = { doLogin, doSignup, getUser }