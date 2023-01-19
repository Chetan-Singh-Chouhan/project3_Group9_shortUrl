const express = require('express');
const route = require('./routes/route.js');
const bodyParser=require("body-parser");
const app = express();
const mongoose  = require('mongoose');

mongoose.set("strictQuery", false)

app.use(bodyParser.json());
// mongoose.connect("mongodb+srv://Chetan_ProjectClustor:PNr1Fn8OcRu2cGmk@project1.h4p8xqh.mongodb.net/group9Database",{useNewUrlParser:true})

mongoose.connect("mongodb+srv://Chetan-functionUp:9EFNNLl4q6IIvejN@cluster0.evsfgyx.mongodb.net/project3_shortUrlDatabase",{useNewUrlParser:true})
.then(()=>console.log("Mongo db is connected"))
.catch(err=>console.log(err))
app.use('/', route);

app.listen(3000, function() {
    console.log('Express app running on port ' + 3000)
});
