
const UrlModel = require("../model/urlModel")
const ShortId = require("shortid");
const validURL = require('valid-url')


//====================================================================//
const isValid = function (value) {
    if (typeof value == "undefined" || value == null) return false;
    if (typeof value == "string" && value.trim().length > 0) return true;
    return false;
};

const isValidRequest = function (object) {
    return Object.keys(object).length > 0;
};

//  using regex for validating url
const isValidUrl = function (value) {
    let regexForUrl =
        /(:?^((https|http|HTTP|HTTPS){1}:\/\/)(([w]{3})[\.]{1})?([a-zA-Z0-9]{1,}[\.])[\w]*((\/){1}([\w@? ^=%&amp;~+#-_.]+))*)$/;
    return regexForUrl.test(value);
};
//=================================================================================//
const urlShortener = async function (req, res) {
    try {
        const requestBody = req.body;

        if (!isValidRequest(requestBody)) {
            return res.status(400).send({ status: false, message: "data is required" });
        }
        //base url is taken from readme
        const longUrl = req.body.longUrl;
        const base = "http://localhost:3000";

        if (!isValid(longUrl)) {
            return res.status(400).send({ status: false, message: "URL is required" });
        }

        if (Object.keys(requestBody).length > 1) {
            return res.status(400).send({ status: false, message: "invalid entry in request body" });
        }

        if (!validURL.isUri(longUrl.trim())) {
            return res.status(400).send({ status: false, message: "Enter a valid URL" })
        }

        if (!isValidUrl(longUrl.trim())) {
            return res.status(400).send({ status: false, message: "Enter a valid URL" });
        }

        let URLDOC = await UrlModel.findOne({ longUrl: longUrl.trim().toLowerCase()}).select({ _id: 0, __v: 0 })
        if (URLDOC) {
            return res.status(201).send({ status: true, message: "url shorten successfully", data: URLDOC })
        }


        const urlCode = ShortId.generate().toLowerCase();
        const shortUrl = base + "/" + urlCode;

        const urlData = { urlCode: urlCode, longUrl: longUrl.trim(), shortUrl: shortUrl };


        const urlData1 = await UrlModel.create(urlData);
        const saveData = ({ longUrl: urlData1.longUrl, shortUrl: urlData1.shortUrl, urlCode: urlData1.urlCode })

        return res.status(201).send({ status: true, message: "url shorten successfully", data: saveData });

    } catch (err) {
        res.status(500).send({ error: err.message });
    }


}


const getUrl = async function (req, res) {
    try {
        const urlCode = req.params.urlCode
        if (!isValidRequest(urlCode)) {
            return res.status(400).send({ status: false, message: "data is required" });
        }
        const url = await UrlModel.findOne({ urlCode: req.params.urlCode })
        if (url) {
            return res.status(302).redirect(url.longUrl)
        } else {
            return res.status(400).send({ status: false, message: "No documnet found with this urlCode" });
        }
    } catch (err) {
        return res.status(500).send({ status: false, message: err.message })
    }
}



module.exports = { urlShortener, getUrl }