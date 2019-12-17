if (process.env.NODE_ENV !== "production") {
  require("dotenv").config()
}

//let PORT = process.env.PORT || 3001
let MONGODB_URL = process.env.MONGODB_URL

module.exports = {
  MONGODB_URL
}