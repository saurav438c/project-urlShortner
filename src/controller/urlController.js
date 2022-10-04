
const UrlModel = require("../model/urlModel")
const ShortId = require("shortid");
const validURL = require('valid-url')
const redis = require("redis");
const { promisify } = require("util");


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
       // /(:?^((https|http|HTTP|HTTPS){1}:\/\/)(([w]{3})[\.]{1})?([a-zA-Z0-9]{1,}[\.])[\w]*((\/){1}([\w@? ^=%&amp;~+#-_.]+))*)$/;//
       /(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})/gi;
    return regexForUrl.test(value);
};

//======================================================//
const redisClient = redis.createClient(
    17402,
    "redis-17402.c264.ap-south-1-1.ec2.cloud.redislabs.com",
    { no_ready_check: true }
  );
  redisClient.auth("vfATbajz7cj12eIPQ2cggzGnzfjxX24S", function (err) {
    if (err) throw err;
  });
  
  redisClient.on("connect", async function () {
    console.log("Connected to Redis..");
  });
const SET_ASYNC = promisify(redisClient.SET).bind(redisClient);
const GET_ASYNC = promisify(redisClient.GET).bind(redisClient);

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
        const url = await UrlModel.findOne({ urlCode: req.params.urlCode })
        const urlDataFromCache = await GET_ASYNC(urlCode);

        if (urlDataFromCache) {

            return res.status(302).redirect(urlDataFromCache);

        } else {
            
            if (!url) {
          return res.status(404).send({ status: false, message: "no such url exist" });
            }

            const addingUrlDataInCache = SET_ASYNC(
                urlCode,
                url.longUrl
            );

            // if we found the document by urlCode then redirecting the user to original url
            return res.status(302).redirect(url.longUrl);
        }
    }
        
     catch (err) {
        return res.status(500).send({ status: false, message: err.message })
    
}
    }


module.exports = { urlShortener, getUrl }
