const puppeteer = require("puppeteer")

let browser

const openBrowser = async () => {
  if (!browser || !browser.isConnected) {
    browser = await puppeteer.launch()
  }
}

const closeBrowser = async () => {
  if (browser) {
    browser.close()
  }
}

const getNewPage = async () => {
  return browser.newPage()
}

module.exports = { openBrowser, closeBrowser, getNewPage }