const axios = require('axios');

function getCurrencyRateByName(currencyName){
    const url = `https://api.binance.com/api/v3/ticker/price?symbol=${currencyName}USDT`
    try{
        return axios.get(url)
    }
    catch(error){
        //console.log('Error', error.message)
        return null
    }
}

module.exports = { getCurrencyRateByName };