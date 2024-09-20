//Dependencies
const { Telegraf, Markup } = require('telegraf');
const axios = require('axios');

//Currency and weather objects have been moved out to allow for expanded functionality
class weatherHelper{
    #ApiKey = '484e4cef38b8b80285dd9e54d5871e91'

    getWeatherByLocation(latitude, longitude){
        const url = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${this.#ApiKey}`;
        return axios.get(url)
    }
}

class currencyHelper{
    getCurrencyRateByName(currencyName){
        const url = `https://api.binance.com/api/v3/ticker/price?symbol=${currencyName}USDT`;
        return axios.get(url)
    }
}

//Bot instance
const bot = new Telegraf('7685296480:AAHRXyxQQH08g64x6flFlHvy0WwWEJgRK7Y')

//Features helpers
const _weatherHelper = new weatherHelper()
const _currencyHelper = new currencyHelper()

//Global variables
let waitingForLocation = false

let Kyiv = [50.4333, 30.5167]
let London = [51.5085, -0.1257]
let Warsaw = [52.2298, 21.0118]

let lastMessageId = null;

//Start action
bot.start((ctx) => {
    const username = ctx.message.from.username || false
    const firstname = ctx.message.from.first_name || false
    const lastname = ctx.message.from.last_name || false
    
    replyToUser = `Hello `
    if(firstname) replyToUser += `${firstname} `
    if(lastname) replyToUser += `${lastname} `
    if(username) replyToUser += `(@${username})!`

    ctx.reply(replyToUser + 
        `\n` + `Now ${new Date().toLocaleString('en-GB', { timeZone: 'Europe/Kyiv' })}. Kyiv` + 
        `\n` + `What do you want to do?`)
    

    lastMessageId = ctx.reply('Choose an option:', Markup.keyboard([
        ['📈 Cryptocurrency Rates', '🌤️ Weather'],
    ]).resize().oneTime()).message_id;
})

//Reply keyboard creation after back button press
bot.action('SHOW_REPLY_KEYBOARD', (ctx) => {
    if(lastMessageId) ctx.deleteMessage(lastMessageId)
    lastMessageId = null
    lastMessageId = ctx.reply('Choose an option:', Markup.keyboard([
        ['📈 Cryptocurrency Rates', '🌤️ Weather'],
    ]).resize().oneTime()).message_id;
})

//WEATHER FEATURE REGION

//Main weather location fetch action
bot.action(/(.+):WEATHER/, async (ctx) =>{
    cityName = ctx.match[1]
    console.log(cityName)
    let response = null
    switch(cityName){
        case 'Kyiv':
            response = await _weatherHelper.getWeatherByLocation(Kyiv[0], Kyiv[1])
            break
        case 'London':
            response = await _weatherHelper.getWeatherByLocation(London[0], London[1])
            break
        case 'Warsaw':
            response = await _weatherHelper.getWeatherByLocation(Warsaw[0], Warsaw[1])
            break
        default:
            break
    }

    ctx.deleteMessage(lastMessageId)
    lastMessageId = null
    ctx.reply(`Weather in ${cityName}:` +
        `\n` + `Temperature: ${(response.data.main.temp - 273.15).toPrecision(3)}°C` +
        `\n` + `Feels like: ${(response.data.main.feels_like - 273.15).toPrecision(3)}°C` +
        `\n` + `Wind: ${response.data.wind.speed.toPrecision(2)} m/s` +
        `\n\n` + `${new Date().toLocaleString('en-GB', { timeZone: 'Europe/Kyiv' })}`, 
        Markup.inlineKeyboard([[Markup.button.callback('🔙Back', 'Weather')]])
    )

    //console.log(response)
})

//Creating inline keyboard for weather
const showWeatherList = async (ctx) => {
    if(lastMessageId) ctx.deleteMessage(lastMessageId)  
    
    const message = await ctx.reply('Choose a location:', Markup.inlineKeyboard([
        [Markup.button.callback('🇺🇦 Kyiv', 'Kyiv:WEATHER')],
        [Markup.button.callback('🇬🇧 London', 'London:WEATHER')],
        [Markup.button.callback('🇵🇱 Warsaw', 'Warsaw:WEATHER')],
        [Markup.button.callback('📍 Weather by location', 'WEATHER_BY_LOCATION')],
        [Markup.button.callback('🔙 Back', 'SHOW_REPLY_KEYBOARD')],
    ]));
    
    lastMessageId = message.message_id; 
};

//Weather by location fetch action
bot.action('WEATHER_BY_LOCATION', async (ctx) =>{
    waitingForLocation = true
    ctx.reply('Please share your location by clicking the button below or pin it directly via Telegram.', Markup.keyboard([
        Markup.button.locationRequest('Send Location')
    ]).oneTime().resize())
})

//Awaiter for message with location
bot.on('location', async (ctx) => {
    if (waitingForLocation) {
        latitude = ctx.message.location.latitude 
        longitude = ctx.message.location.longitude

        ctx.deleteMessage(lastMessageId)
        lastMessageId = null
        try {
            response = await _weatherHelper.getWeatherByLocation(latitude, longitude);
            ctx.reply(`Weather at your location(${response.data.name}):` +
                `\n` + `Temperature: ${(response.data.main.temp - 273.15).toPrecision(3)}°C` +
                `\n` + `Feels like: ${(response.data.main.feels_like - 273.15).toPrecision(3)}°C` +
                `\n` + `Wind: ${response.data.wind.speed.toPrecision(2)} m/s` +
                `\n\n` + `${new Date().toLocaleString('en-GB', { timeZone: 'Europe/Kyiv' })}`, 
                Markup.inlineKeyboard([[Markup.button.callback('🔙Back', 'Weather')]])
            )
        } catch (error) {
            console.log(error)
            ctx.reply('Could not fetch weather data. Please try again later.');
        }

        waitingForLocation = false; // Reset the state
    }
});

//Weather command catchers
bot.action(['Weather'], (ctx) => {
    showWeatherList(ctx);
})

bot.hears(['🌤️ Weather'], (ctx) => {
    showWeatherList(ctx);
})

//WEATHER FEATURE REGION END

//CURRENCY FEATURE REGION

//Main currency fetch action
bot.action(/(.+):CURRENCY/, async (ctx) =>{
    currencyName = ctx.match[1]
    let response = null
    switch(currencyName){
        case 'BTC':
            response = await _currencyHelper.getCurrencyRateByName(currencyName)
            break
        case 'ETH':
            response = await _currencyHelper.getCurrencyRateByName(currencyName)
            break
        default:
            break
    }
    console.log(response.data)

    ctx.deleteMessage(lastMessageId)
    lastMessageId = null
    ctx.reply(`Currency rate(${currencyName}):` +
        `\n` + `1 ${currencyName} = ${response.data.price.slice(0,10)} USDT` +
        `\n\n` + `${new Date().toLocaleString('en-GB', { timeZone: 'Europe/Kyiv' })}`, 
        Markup.inlineKeyboard([[Markup.button.callback('🔙Back', 'Cryptocurrency Rates')]])
    )

    //console.log(response)
})

//Creating inline keyboard for currencies
const showCryptocurrencyList = async (ctx) => {
    if(lastMessageId) ctx.deleteMessage(lastMessageId)

    const message = await ctx.reply('Choose a currency:', Markup.inlineKeyboard([
        [Markup.button.callback('₿ Bitcoin', 'BTC:CURRENCY')],
        [Markup.button.callback('Ξ Ethereum', 'ETH:CURRENCY')],
        [Markup.button.callback('🔙Back', 'SHOW_REPLY_KEYBOARD')],
    ]));

    lastMessageId = message.message_id; 
};

//Currency command catchers
bot.action(['Cryptocurrency Rates'], (ctx) => {
    showCryptocurrencyList(ctx);
})

bot.hears(['📈 Cryptocurrency Rates'], (ctx) => {
    showCryptocurrencyList(ctx);
})

//CURRENCY FEATURE REGION END


//Bot launch
bot.launch()

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))