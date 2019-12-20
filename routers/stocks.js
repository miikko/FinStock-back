const stocksRouter = require("express").Router()
const Stock = require("../db/stock")

stocksRouter.get("/", async (req, res, next) => {
  try {
    const stocks = await Stock.find({})
    const jsonStocks = await Promise.all(
      stocks.map(stock => stock.toJSON())
    )
    res.json(jsonStocks)
  } catch (exception) {
    console.error(exception)
    res.status(500).end()
  }
})

module.exports = stocksRouter