//Dependencies
const { Telegraf, Markup } = require('telegraf');
const { getApiWithLocation } = require('./util/weatherApi')
const { getApiWithCurrency } = require('./util/currencyApi')
const { getKyivDayTime } = require('./util/daytimeKyiv')
const { getApiResponse } = require('./util/getApiResponse')
const { CITIES, CURRENCY_MAPPING } = require('./constants')
const { 
    replyKeyboard,
    currencyListKeyboard,
    weatherListKeyboard,
    unexpectedErrorKeyboard,
    backToCurrencyKeyboard,
    backToWeatherKeyboard
 } = require('./keyboards')
 
require('dotenv').config();

//Bot instance
const bot = new Telegraf(process.env.BOT_API)

//Global variables
//let waitingForLocation = false
let lastMessageId


const deleteLastMessage = (ctx) => {
    if(lastMessageId){
        ctx.deleteMessage(lastMessageId)
    }
    lastMessageId = null
}

const replyWithKeyboard = async (ctx, message, keyboard) => {
    const reply = await ctx.reply(message, keyboard)
    lastMessageId = reply.message_id
}

const showMessage = (ctx, message, keyboard) => {
    deleteLastMessage(ctx)
    replyWithKeyboard(ctx, message, keyboard)
}

const showReplyKeyboard = async (ctx) => showMessage(ctx, 'Choose an option:', replyKeyboard)

const showWeatherList = async (ctx) => showMessage(ctx, 'Choose a location:', weatherListKeyboard)
const showCryptocurrencyList = async (ctx) => showMessage(ctx, 'Choose a currency:', currencyListKeyboard)

const showCurrencyMenuKeyboard = async (ctx) => showMessage(ctx, 'Choose an option:', backToCurrencyKeyboard)
const showWeatherMenuKeyboard = async (ctx) => showMessage(ctx, 'Choose an option:', backToWeatherKeyboard)

const showUnexpectedErrorKeyboard = async (ctx) => showMessage(ctx, 'An unexpected error occurred while retrieving the data, try again later', unexpectedErrorKeyboard)


const weatherAction = async (ctx) =>{
    let cityName = ctx.match[1]
    let locationCoords = CITIES[cityName]

    let response = await getApiResponse(getApiWithLocation(locationCoords[0], locationCoords[1]))
    
    deleteLastMessage(ctx)

    if(response == null){
        showUnexpectedErrorKeyboard(ctx)
        return
    }

    const temp = (response.data.main.temp -273.15).toPrecision(3)
    const feelsLike = (response.data.main.feels_like -273.15).toPrecision(3)
    const windSpeed = response.data.wind.speed.toPrecision(2)
    
    await ctx.reply(`Weather in ${cityName}:
        \n🌡️Temperature: ${temp}°C\n🌡️Feels like: ${feelsLike}°C\n🌬️Wind: ${windSpeed} m/s
        \n${getKyivDayTime()}`
    )

    showWeatherMenuKeyboard(ctx)
}

const currencyAction = async (ctx) => {
    currencyName = ctx.match[1]

    let response = await getApiResponse(getApiWithCurrency(CURRENCY_MAPPING[currencyName]))

    deleteLastMessage(ctx)

    if(response == null){
        showUnexpectedErrorKeyboard(ctx)
        return
    }

    const rate = response.data.price.slice(0,10)

    await ctx.reply(`Currency rate(${currencyName}):
        \n1 ${currencyName} = ${rate} USDT
        \n${getKyivDayTime()}`
    )
    
    showCurrencyMenuKeyboard(ctx)
}

bot.action('ShowReplyKeyboard', showReplyKeyboard);

bot.action(['Weather'], showWeatherList)
bot.hears(['🌤️ Weather'], showWeatherList)

bot.action(['Cryptocurrency Rates'], showCryptocurrencyList)
bot.hears(['📈 Cryptocurrency Rates'], showCryptocurrencyList)

bot.action(/(.+):WEATHER/, weatherAction)
bot.action(/(.+):CURRENCY/, currencyAction)

//Start action
bot.start((ctx) => {
    const {first_name, last_name, username} = ctx.message.from

    replyToUser = `Hello ${first_name ? `${first_name} ` : ''}${last_name ? `${last_name} ` : ''}${username ? `(@${username})!` : '!'}`

    ctx.reply(`${replyToUser}\nNow ${getKyivDayTime()}. Kyiv\nWhat do you want to do?`)
    
    showReplyKeyboard(ctx)
})

//Bot launch
bot.launch()

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))

/*
//Weather by location fetch action
bot.action('WEATHER_BY_LOCATION', async (ctx) =>{
    waitingForLocation = true
    deleteLastMessage(ctx)

    const message = ctx.reply('Please share your location by clicking the button below or pin it directly via Telegram.', 
        Markup.inlineKeyboard([[Markup.button.callback('🔙Back', 'Weather')]]).resize()
    )
    lastMessageId = message.message_id
    
    await ctx.reply('.', Markup.keyboard([[Markup.button.locationRequest('Send Location')]]).oneTime().resize())

})

//Awaiter for message with location
bot.on('location', async (ctx) => {
    if(!waitingForLocation){
        return
    }
    
    const {latitude = 0, longitude = 0} = ctx.message?.location
    
    try {   
        response = await getWeatherByLocation(latitude, longitude);
        
        const temp = (response.data.main.temp -273.15).toPrecision(3)
        const feelsLike = (response.data.main.feels_like -273.15).toPrecision(3)
        const windSpeed = response.data.wind.speed.toPrecision(2)
        
        ctx.reply(`Weather at your location(${response.data.name}):\n
            Temperature: ${temp}°C
            Feels like: ${feelsLike}°C
            Wind: ${windSpeed} m/s\n
            ${getKyivDayTime()}`, 
        Markup.inlineKeyboard([[Markup.button.callback('🔙Back', 'Weather')]])
    )
    } catch (error) {
        //console.log(error)
        ctx.reply('Could not fetch weather data. Please try again later.');
    }

    waitingForLocation = false; // Reset the state
});

*/
