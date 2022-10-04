//================================= Importing ======================================================//

const express = require("express")
const router = express.Router()
const UrlController = require('../controller/urlController')

//==================================== API ==================================================//

router.post("/url/shorten", UrlController.urlShortener)
router.get("/:urlCode", UrlController.getUrl)

router.get('/:urlCode', UrlController.getUrl)


//==================================== Exporting ==================================================//

module.exports = router

//==================================== xxxxxxxxxxx ==================================================//