const axios = require('axios');

getApiResponse = (url) => axios.get(url).catch(() => {
    console.log('Error', error.message)
    return}
)

module.exports = { getApiResponse }