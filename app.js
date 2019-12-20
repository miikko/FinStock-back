const express = require("express")
const cors = require("cors")
const bodyParser = require("body-parser")
const config = require("./utils/config")
const dbManager = require("./db/dbManager")
const pricesRouter = require("./routers/prices")
const stocksRouter = require("./routers/stocks")

const app = express()

dbManager.openConnection(config.MONGODB_URL)

app.use(cors())
app.use(bodyParser.json())

app.use("/api/prices", pricesRouter)
app.use("/api/stocks", stocksRouter)

module.exports = app