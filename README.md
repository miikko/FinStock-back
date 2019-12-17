# FinStock-back

Backend for FinStock stock-finder. Scrapes stock key-indicators from stocks listed in the Helsinki XHEL stock-market.

---
## Requirements

For development, you will only need [Node.js](https://nodejs.org/) installed in your environment.

## Install

    $ git clone https://github.com/miikko/FinStock-back
    $ cd FinStock-back
    $ npm install

## Configure project

In order to save data to a MongoDB database, a MONGODB_URL environment variable needs to be set. One way to set it is to create a `.env` file at the project root folder and add the following content: `MONGODB_URL=YOUR_MONGO_URL_HERE`.

## Running the project

To scrape stock data from [Kauppalehti](https://www.kauppalehti.fi/porssi/kurssit/XHEL) to a database:

```
$ npm run scrape
 ```
