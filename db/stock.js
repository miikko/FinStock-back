const mongoose = require("mongoose")
const uniqueValidator = require("mongoose-unique-validator")

/*
keyIndicators: {
 Markkina-arvo: {
   2014: '81.70',
   ...,
 },
 PE-luku: {

 }
*/
const stockSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  url: {
    type: String,
    required: true,
    unique: true
  },
  indicators: {
    type: Object,
    required: true
  }
})

stockSchema.plugin(uniqueValidator)

stockSchema.set("toJSON", {
  transform: (document, returnedObject) => {
    delete returnedObject.__v
  }
})

module.exports = mongoose.model("Stock", stockSchema)