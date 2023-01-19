const urlModel = require("../models/urlModel");
const validUrl = require("valid-url");
const shortId = require("shortid")
const redis = require("redis")
const { promisify } = require("util");
const { json } = require("express");
const { url } = require("inspector");
//const isValidLink = (Link) => /^https?:\/\/+(.)$/ .test(Link)
const isValidLink = (Link) => /^(http(s):\/\/.)[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)$/.test(Link)
//1. Connect to the redis server----------------
const redisClient = redis.createClient(
    13342,
    "redis-13342.c301.ap-south-1-1.ec2.cloud.redislabs.com",
    { no_ready_check: true }
);
redisClient.auth("W4JBEi9mAzxjApllYRWwLykeqC3iD9Sn", function (err) {
    if (err) throw err;
});

redisClient.on("connect", async function () {
    console.log("Connected to Redis..");
});

//2. Prepare the functions for each command----------------------------------

const SETEX_ASYNC = promisify(redisClient.SETEX).bind(redisClient);
const GET_ASYNC = promisify(redisClient.GET).bind(redisClient);



const makeShortUrl = async function (req, res) {
    try {

        let urlData = req.body;
        if (Object.keys(urlData).length == 0)
            return res.status(400).send({ status: false, message: "please put a url" });
        if (typeof (urlData.longUrl) != "string")
            return res.status(400).send({ status: false, message: "Long Url must be of String Only" });
        if (!validUrl.isUri(req.body.longUrl))
            return res.status(400).send({ status: false, message: "please put a valid url" });
        // if(!isValidLink(urlData.longUrl)){
        //     return res.status(400).send({ status: false, message: "please put a valid url" });

        // }
        let cachedUrl = await GET_ASYNC(`${urlData.longUrl}`)
        if(cachedUrl){
            console.log("1")
            return res.status(200).send({ status: true, data: JSON.parse(cachedUrl) }); }
        let findUrl = await urlModel.findOne({ longUrl: urlData.longUrl }).select({ urlCode: 1, longUrl: 1, shortUrl: 1, })
        if (findUrl){
            console.log("2")
            return res.status(200).send({ status: true, data: findUrl }); }
        //generating short url Code 
        urlData.urlCode = shortId.generate();
        urlData.shortUrl = `localhost:3000/${urlData.urlCode.toLowerCase()}`;
        
        let newShortedUrl = await urlModel.create(urlData);
        await SETEX_ASYNC(`${urlData.longUrl}`,60,JSON.stringify(urlData))
        return res.status(201).send({ status: true, data: newShortedUrl })
    }
    catch (error) {
        return res.status(500).send({ status: false, message: error.message })
    }
};

const reDirect = async function (req, res) {
    try {
        let urlCode = req.params.urlCode;
        
        //----
        let cachedUrl = await GET_ASYNC('name')
        if(cachedUrl){
            console.log("1")
            return res.send(JSON.parse(cachedUrl))}
        //----
        if (!urlCode)
            return res.status(400).send({ status: false, message: "Please Enter urlCode in url" })
        let validShortId = shortId.isValid(urlCode);
        console.log(validShortId)

        if (!validShortId)
            return res.status(400).send({ status: false, message: "invalid url code" })
        let findUrl = await urlModel.findOne({ urlCode: urlCode });
        console.log(findUrl)
        if (!findUrl)
            return res.status(404).send("can't find url code");
        return res.status(302).redirect(findUrl.longUrl)
        //return res.status(302).send(findUrl.longUrl)

    }
    catch (error) {
        return res.status(500).send({ status: false, message: error.message })
    }

}

module.exports = { makeShortUrl, reDirect };
