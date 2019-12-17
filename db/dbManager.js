const mongoose = require("mongoose")
const Stock = require('./stock')

const openConnection = async (url) => {
  await mongoose.connect(url, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false
  })
  console.log("Connected to MongoDB")
}

const closeConnection = async () => {
  await mongoose.connection.close()
}
/**
 * Saves the given stock if no saved stock with a same name was found.
 * An error is thrown, if a stock with a same name is already saved.
 * For updating stocks, use updateStock() instead.
 * @param {Object} stock 
 */
const saveStock = async (stock) => {
  const stockObject = new Stock(stock)
  const savedStock = await stockObject.save({ checkKeys: false })
  return savedStock.toJSON()
}

const updateStock = async (stock) => {
  const existingStock = await Stock.findOne({ name: stock.name })
  const indicatorNames = Object.keys(stock.indicators)
  const someIndicatorName = indicatorNames[0]
  const savedIndicator = existingStock.indicators[someIndicatorName]
  const newIndicator = stock.indicators[someIndicatorName]
  const yearsToAdd = getMissingYears(savedIndicator, newIndicator)
  if (yearsToAdd.length === 0) {
    return stock
  }
  yearsToAdd.map(yearToAdd => {
    indicatorNames.map(indicatorName => {
      const valueToAdd = stock.indicators[indicatorName][yearToAdd]
      existingStock.indicators[indicatorName][yearToAdd] = valueToAdd
    })
  })
  const updatedStock = await Stock.findByIdAndUpdate(
    existingStock._id, existingStock, { new: true, checkKeys: false }
  )
  return updatedStock.toJSON()
}

const getMissingYears = (oldIndicator, newIndicator) => {
  const oldYears = Object.keys(oldIndicator).map(year => parseInt(year))
  const newYears = Object.keys(newIndicator).map(year => parseInt(year))
  oldYears.sort((a, b) => a - b)
  const latestOldYear = oldYears[oldYears.length - 1]
  return newYears.filter(year => year > latestOldYear)
}

const findStockByName = async (stockName) => {
  return Stock.findOne({ name: stockName })
}

module.exports = {
  openConnection,
  closeConnection,
  saveStock,
  updateStock,
  findStockByName
}