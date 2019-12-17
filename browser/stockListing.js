const browsingManager = require("./browsingManager")

const baseUrl = "https://www.kauppalehti.fi/porssi/kurssit/XHEL"

const getStockDivs = async (page) => {
  const divSelector = ".list-item-wrapper"
  await page.waitForSelector(divSelector)
  const stockDivs = await page.$$(divSelector)
  return stockDivs
}

const getPrices = async () => {
  const stockListColSelector = ".stock-list-column"
  const page = await browsingManager.getNewPage()
  await page.goto(baseUrl)
  await page.waitForSelector(stockListColSelector)
  const stockDivs = await getStockDivs(page)
  const prices = await Promise.all(stockDivs.map(div =>
    div.$$eval(stockListColSelector, cols => (
      { name: cols[0].innerText, price: cols[1].innerText }
    ))
  ))
  await page.close()
  return prices
}

/*
When database is set, it's better to save the stock identifier 
(for example Afarak Group: AFAGR) to the database instead of using this.
Stockpage URL for Afarak Group:
https://www.kauppalehti.fi/porssi/porssikurssit/osake/AFAGR
*/
const getListedStockNamesAndUrls = async () => {
  const stockNameSelector = ".short-name"
  const page = await browsingManager.getNewPage()
  await page.goto(baseUrl)
  await page.waitForSelector(stockNameSelector)
  const stockDivs = await getStockDivs(page)
  const listedStocks = await Promise.all(stockDivs.map(async stockDiv => ({
    name: await stockDiv.$eval(
      stockNameSelector,
      stockNameEl => stockNameEl.innerText
    ),
    url: await stockDiv.$eval("a", link => link.href)
  })))
  await page.close()
  return listedStocks
}

module.exports = { getPrices, getListedStockNamesAndUrls }