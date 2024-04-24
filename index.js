const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const dbObj = require("./config/dbconfig");
var bodyparser = require("body-parser");
const Router = require("./Router");
const dotenv = require("dotenv");
const app = express();

dotenv.config();
app.use(cors());

app.use(bodyparser.json());
app.listen(2003, () => {
    console.log("connected successfully....");
})
const server = dbObj.dburl;
mongoose.connect(server).then(() => {
    console.log("connected to mongo");
}).catch((err) => {
    console.log(err);
})
app.use(express.urlencoded(true));
app.use("/product", Router);

// app.use('/login', (req, res) => {
//     res.send({
//         token: 'test123'
//     });
// });