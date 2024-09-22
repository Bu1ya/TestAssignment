const axios = require('axios');

function getWeatherByLocation(latitude, longitude){
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${process.env.WEATHER_API_KEY}`
    try{
        return axios.get(url)
    }
    catch(error){
        //console.log('Error', error.message)
        return null
    }
}

module.exports = { getWeatherByLocation };