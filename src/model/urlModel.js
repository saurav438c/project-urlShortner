//================================= Importing ======================================================//

const mongoose = require('mongoose')

//================================= Creating a Schema ==============================================//

const urlSchema = new mongoose.Schema({
    urlCode: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    longUrl: {
        type: String,
        required: true,
        trim: true,
        lowercase: true
    },
    shortUrl: {
        type: String,
        unique: true,
        required: true
    }
},{timestamp: false})

//==================================== Exporting ==================================================//

module.exports = mongoose.model("URL", urlSchema)

//==================================== xxxxxxxxxx ==================================================//