getKyivDayTime = () => new Date().toLocaleString('en-GB', { timeZone: 'Europe/Kyiv' })
    
module.exports = { getKyivDayTime };