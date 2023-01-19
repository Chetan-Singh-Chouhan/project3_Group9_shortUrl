const express = require('express');
const router = express.Router();
const { makeShortUrl, reDirect } = require("../controller/urlController")

//url's
router.post("/url/shorten", makeShortUrl)
router.get("/:urlCode", reDirect)
router.all('/*', function (req, res) {
    res.status(404).send({ status: false, msg: 'page not found' });
});
module.exports = router