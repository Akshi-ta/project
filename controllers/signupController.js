const SignupInfo = require("../models/signup")

function doSignup(req, resp) {
    const info = new SignupInfo(req.body);
    console.log(info);
    info.save().then((ans) => {
        console.log(ans);
        // resp.send(ans);
        resp.json({ status: true, rec: ans, out: "yay" });
    }).catch((err) => {
        console.log(err.message);
        // resp.send(err.message);
    })
}

function doLogin(req, resp) {
    SignupInfo.find({ email: req.body.email }).then((result) => {
        console.log(result[0]);
        if (result[0].password === req.body.password) {
            console.log("trueeeee");
            resp.json({ status: true, res: "password matches", type: result[0].utype});
        }
        else {
            console.log("password doesn't match");
            resp.json({ status: false, res: "password doesn't match" });
        }
    }).catch(function (err) {
        resp.json({ status: false, res: err.message });
    })
}


module.exports = { doLogin, doSignup }