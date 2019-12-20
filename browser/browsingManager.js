const puppeteer = require("puppeteer")

let browser

const openBrowser = async () => {
  if (!browser || !browser.isConnected) {
    browser = await puppeteer.launch()
  }
}

const closeBrowser = async () => {
  if (browser) {
    await browser.close()
    browser = null
  }
}

const getNewPage = async () => {
  return browser.newPage()
}

const numOfPagesOpen = async () => {
  if (!browser) {
    return 0
  }
  const pages = await browser.pages()
  return pages.length
}

module.exports = {
  openBrowser,
  closeBrowser,
  getNewPage,
  numOfPagesOpen
}