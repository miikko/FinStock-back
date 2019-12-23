const browsingManager = require("./browsingManager")

const getIndicators = async (pageUrl) => {
  const page = await browsingManager.getNewPage()
  await page.goto(pageUrl + "/tilinpaatos")
  const validPage = await recordsExist(page)
  if (!validPage) {
    await page.close()
    console.log(`No records for: ${pageUrl}`)
    return
  }
  const recordedYears = await getRecordedYears(page)
  const tableRows = await getTableRows(page)
  const indicatorArray = await Promise.all(tableRows.map(
    row => extractIndicator(row, recordedYears)
  ))
  await page.close()
  const indicatorObject = indicatorArray.reduce((accumulator, arrayElement) => {
    accumulator[arrayElement.name] = arrayElement
    delete accumulator[arrayElement.name].name
    return accumulator  
  }, {})
  return indicatorObject
}

const recordsExist = async (page) => {
  const errorMessageSelector = ".financials-error-info-text"
  try {
    await page.waitForSelector(errorMessageSelector, { timeout: 2000 })
  } catch(error) {
    return true
  }
  return false
}

const getTableRows = async (page) => {
  const tableRowSelector = ".list-item-wrapper"
  await page.waitForSelector(tableRowSelector)
  return page.$$(tableRowSelector)
}

/*
Key indicators for stocks in Kauppalehti are stored in tables.
The tables contain six columns. (Written on 10.12.2019)
The first column header is empty and the rest are years in this format:
12/last two digits of the year, in the 20th century.
For example the column header for the year 2014 is represented like this: 12/14.
*/
const getRecordedYears = async (page) => {
  const headerRowSelector = ".stock-list-head"
  const headerColSelector = ".stock-list-column"
  await page.waitForSelector(headerRowSelector)
  await page.waitForSelector(headerColSelector)
  const headerRow = await page.$(headerRowSelector)
  const recordedYears = await headerRow.$$eval(headerColSelector, headerCols => {
    return headerCols.map(headerCol => {
      const headerText = headerCol.innerText
      if (headerText) {
        const lastTwoDigits = headerText.substring(headerText.length - 2)
        return "20" + lastTwoDigits
      }
    })
  })
  recordedYears.shift()
  return recordedYears
}

const extractIndicator = async (row, recordedYears) => {
  return row.$$eval(".stock-list-column", (columns, recordedYears) => {
    const indicator = {
      name: columns[0].innerText
    }
    if (indicator.name === "Markkina-arvo") {
      indicator.name = "Markkina-arvo (P)"
    }
    for (let i = 0; i < recordedYears.length; i++) {
      indicator[recordedYears[i]] = columns[i + 1].innerText 
    }
    return indicator
  }, recordedYears)
}

module.exports = { getIndicators }