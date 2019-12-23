const stockListing = require("./browser/stockListing")
const stockPageExtractor = require("./browser/stockPageExtractor")
const browsingManager = require("./browser/browsingManager")
const dbManager = require("./db/dbManager")
const config = require("./utils/config")

const numOfStocksInMarket = 141

const main = async () => {
  await browsingManager.openBrowser()
  const stockNamesAndUrls = await stockListing.getListedStockNamesAndUrls()
  const stocks = []
  for (let i = 0; stockNamesAndUrls.length > 0; i+=5) {
    const subArray = stockNamesAndUrls.splice(0, 5)
    const stockPromises = await Promise.all(subArray.map(async stockNameAndUrl => ({
      name: stockNameAndUrl.name,
      url: stockNameAndUrl.url,
      indicators: await stockPageExtractor.getIndicators(stockNameAndUrl.url)
    })))
    stocks.push(...stockPromises)
    console.log(`${stockNamesAndUrls.length} stocks remaining`)
  }
  await browsingManager.closeBrowser()
  if (stocks.length !== numOfStocksInMarket) {
    console.log("Something went wrong")
    return
  }
  const filteredStocks = stocks.filter(stock => stock.indicators)
  await dbManager.openConnection(config.MONGODB_URL)
  const savedStocks = await Promise.all(filteredStocks.map(async stock => {
    const existingStock = await dbManager.findStockByName(stock.name)
    if (existingStock) {
      return dbManager.updateStock(stock)
    }
    return dbManager.saveStock(stock)
  }))
  await dbManager.closeConnection()
  console.log(`${savedStocks.filter(stock => stock).length} stocks saved/updated`)
}

main()