const pricesRouter = require("express").Router()
const browsingManager = require("../browser/browsingManager")
const stockListing = require("../browser/stockListing")
const { minutesPassedSince } = require("../utils/timeUtil")

const priceInfo = {}

const updatePriceInfo = async () => {
  await browsingManager.openBrowser()
  priceInfo.prices = await stockListing.getPrices()
  priceInfo.lastUpdate = new Date()
  if (browsingManager.numOfPagesOpen() === 1) {
    await browsingManager.closeBrowser()
  }
}

pricesRouter.get("/", async (req, res, next) => {
  try {
    const lastUpdate = priceInfo.lastUpdate
    if (!lastUpdate || minutesPassedSince(lastUpdate.getTime()) >= 5) {
      await updatePriceInfo()
    }
    res.json(priceInfo)
  } catch (exception) {
    console.error(exception)
    res.status(500).end()
  }
})

pricesRouter.get("/:name", async (req, res, next) => {
  try {
    const lastUpdate = priceInfo.lastUpdate
    if (!lastUpdate || minutesPassedSince(lastUpdate.getTime()) >= 5) {
      await updatePriceInfo()
    }
    const price = priceInfo.prices.find(
      price => price.name === req.params.name
    )
    if (!price) {
      return res.status(404).send("No stock found with that name.")
    }
    price.lastUpdate = priceInfo.lastUpdate
    res.json(price)
  } catch (exception) {
    console.error(exception)
    res.status(500).end()
  }
})

module.exports = pricesRouter