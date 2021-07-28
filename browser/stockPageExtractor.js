const browsingManager = require("./browsingManager")

const wantedIndicatorNames = [
  "Markkina-arvo (P)",
  "Markkina-arvo",
  "Osinko/osake, eur",
  "P/B-luku",
  "P/E-luku",
  "Oman pääoman tuotto-%",
  "Oman pääoman tuotto, %",
  "Nettovelkaantumisaste, %",
  "Current Ratio",
]

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
  const tableRows = await getRelevantTableRows(page)
  const indicatorArray = await Promise.all(
    tableRows.map((row) => extractIndicator(row, recordedYears))
  )
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
  } catch (error) {
    return true
  }
  return false
}

const getRelevantTableRows = async (page) => {
  const tableRowSelector = ".wzulpl-3"
  const indicatorNameSelector = ".wzulpl-1"
  await page.waitForSelector(tableRowSelector)
  const allTableRows = await page.$$(tableRowSelector)
  const relevantTableRows = await Promise.all(
    allTableRows.map(async (tableRow) => {
      const relevant = await tableRow.$eval(
        indicatorNameSelector,
        (indicatorNameEl, wantedIndicatorNames) =>
          wantedIndicatorNames.includes(indicatorNameEl.innerText),
        wantedIndicatorNames
      )
      if (relevant) {
        return tableRow
      }
    })
  )
  return relevantTableRows.filter((row) => row)
}

/*
Key indicators for stocks in Kauppalehti are stored in tables.
The tables contain six columns. (Written on 10.12.2019)
The first column header is empty and the rest are years in this format:
12/last two digits of the year, in the 20th century.
For example the column header for the year 2014 is represented like this: 12/14.
*/
const getRecordedYears = async (page) => {
  const headerRowSelector = ".lca1tt-2"
  const headerColSelector = ".kWrbE"
  await page.waitForSelector(headerRowSelector)
  await page.waitForSelector(headerColSelector)
  const headerRow = await page.$(headerRowSelector)
  const recordedYears = await headerRow.$$eval(
    headerColSelector,
    (headerCols) => {
      return headerCols.map((headerCol) => {
        const headerText = headerCol.innerText
        if (headerText) {
          const lastTwoDigits = headerText.substring(headerText.length - 2)
          return "20" + lastTwoDigits
        }
      })
    }
  )

  return recordedYears
}

const extractIndicator = async (row, recordedYears) =>
  row.$$eval(
    ".wzulpl-0",
    (columns, recordedYears) => {
      const indicator = {
        name: columns[0].innerText,
      }
      if (indicator.name === "Markkina-arvo (P)") {
        indicator.name = "Markkina-arvo"
      } else if (indicator.name === "Oman pääoman tuotto, %") {
        indicator.name = "Oman pääoman tuotto-%"
      }
      for (let i = 0; i < recordedYears.length; i++) {
        indicator[recordedYears[i]] = columns[i + 1].innerText.replace(",", "")
      }
      return indicator
    },
    recordedYears
  )

module.exports = { getIndicators }
