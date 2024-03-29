const stockListing = require("./browser/stockListing")
const stockPageExtractor = require("./browser/stockPageExtractor")
const browsingManager = require("./browser/browsingManager")
const dbManager = require("./db/dbManager")
const config = require("./utils/config")

const numOfStocksInMarket = 144

const main = async () => {
  if (!config.MONGODB_URL) {
    console.log("MONGODB_URL environment variable not set!")
    return
  }
  await browsingManager.openBrowser()
  const stockNamesAndUrls = await stockListing.getListedStockNamesAndUrls()
  const stocks = []
  for (let i = 0; stockNamesAndUrls.length > 0; i += 5) {
    const subArray = stockNamesAndUrls.splice(0, 5)
    const stockPromises = await Promise.all(
      subArray.map(async (stockNameAndUrl) => ({
        name: stockNameAndUrl.name,
        url: stockNameAndUrl.url,
        indicators: await stockPageExtractor.getIndicators(stockNameAndUrl.url),
      }))
    )
    stocks.push(...stockPromises)
    console.log(`${stockNamesAndUrls.length} stocks remaining`)
  }
  await browsingManager.closeBrowser()
  if (stocks.length !== numOfStocksInMarket) {
    console.log(
      "Unusual amount of stocks scraped, expected " +
        `${numOfStocksInMarket}, got ${stocks.length}`
    )
  }
  const filteredStocks = stocks.filter((stock) => stock.indicators)
  await dbManager.openConnection(config.MONGODB_URL)
  const savedStocks = await Promise.all(
    filteredStocks.map(async (stock) => {
      const existingStock = await dbManager.findStockByURL(stock.url)
      if (existingStock) {
        return dbManager.updateStock(stock)
      }
      return dbManager.saveStock(stock)
    })
  )
  await dbManager.closeConnection()
  console.log(
    `${savedStocks.filter((stock) => stock).length} stocks ` + "saved/updated"
  )
}

main()
