getApiWithCurrency = (currencyName) => `https://api.binance.com/api/v3/ticker/price?symbol=${currencyName}USDT`

module.exports = { getApiWithCurrency }