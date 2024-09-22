//Dependencies
const { Telegraf, Markup } = require('telegraf');
const {getWeatherByLocation} = require('./util/weather-helper')
const {getCurrencyRateByName} = require('./util/currency-helper')
const {getKyivDayTime} = require('./util/daytime-helper')
const {CITIES, CURRENCY_MAPPING} = require('./constants')
require('dotenv').config();

//Bot instance
const bot = new Telegraf(process.env.BOT_API)

//Global variables
//let waitingForLocation = false
let lastMessageId


function deleteLastMessage(ctx){
    if(lastMessageId){
        ctx.deleteMessage(lastMessageId)
    }
    lastMessageId = null
}

async function showReplyKeyboard(ctx){
    deleteLastMessage(ctx)
    
    const message = await ctx.reply('Choose an option:',
        Markup.keyboard([['📈 Cryptocurrency Rates', '🌤️ Weather']]).resize().oneTime())
    
    lastMessageId = message.message_id
}

//Creating inline keyboard for weather
const showWeatherList = async (ctx) => {
    deleteLastMessage(ctx)
    
    const message = await ctx.reply('Choose a location:', 
        Markup.inlineKeyboard([
        [Markup.button.callback('🇺🇦 Kyiv', 'Kyiv:WEATHER')],
        [Markup.button.callback('🇬🇧 London', 'London:WEATHER')],
        [Markup.button.callback('🇵🇱 Warsaw', 'Warsaw:WEATHER')],
        //[Markup.button.callback('📍 Weather by location', 'WEATHER_BY_LOCATION')],
        [Markup.button.callback('🔙 Back', 'ShowReplyKeyboard')],
    ]));
    lastMessageId = message.message_id
};

//Creating inline keyboard for currencies
const showCryptocurrencyList = async (ctx) => {
    deleteLastMessage(ctx)
    
    const message = await ctx.reply('Choose a currency:', 
        Markup.inlineKeyboard([
            [Markup.button.callback('₿ Bitcoin', 'BTC:CURRENCY')],
            [Markup.button.callback('Ξ Ethereum', 'ETH:CURRENCY')],
            [Markup.button.callback('🔙Back', 'ShowReplyKeyboard')],
        ]))
        
        lastMessageId = message.message_id
    };
    

bot.action('ShowReplyKeyboard', showReplyKeyboard);

bot.action(['Weather'], showWeatherList)
bot.hears(['🌤️ Weather'], showWeatherList)

bot.action(['Cryptocurrency Rates'], showCryptocurrencyList)
bot.hears(['📈 Cryptocurrency Rates'], showCryptocurrencyList)

//Main weather location fetch action
bot.action(/(.+):WEATHER/, async (ctx) =>{
    let cityName = ctx.match[1]
    let locationCoords = CITIES[`${cityName}`]

    let response = await getWeatherByLocation(locationCoords[0], locationCoords[1])
    
    deleteLastMessage(ctx)

    if(response == null){
        const message = await ctx.reply('An unexpected error occurred while retrieving the weather, try again later',
            Markup.inlineKeyboard([
                [Markup.button.callback('🔙Return', 'ShowReplyKeyboard')],
            ])
        )
        lastMessageId = message.message_id
        return
    }

    const temp = (response.data.main.temp -273.15).toPrecision(3)
    const feelsLike = (response.data.main.feels_like -273.15).toPrecision(3)
    const windSpeed = response.data.wind.speed.toPrecision(2)

    
    ctx.reply(`Weather in ${cityName}:
        \n🌡️Temperature: ${temp}°C\n🌡️Feels like: ${feelsLike}°C\n🌬️Wind: ${windSpeed} m/s
        \n${getKyivDayTime()}`,
    Markup.inlineKeyboard([[Markup.button.callback('🔙Back', 'Weather')]])
    )
})

//Main currency fetch action
bot.action(/(.+):CURRENCY/, async (ctx) =>{
    currencyName = ctx.match[1]

    let response = await getCurrencyRateByName(CURRENCY_MAPPING[currencyName])

    deleteLastMessage(ctx)

    if(response == null){
        const message = await ctx.reply('An unexpected error occurred while retrieving the current rate, try again later',
            Markup.inlineKeyboard([
                [Markup.button.callback('🔙Return', 'ShowReplyKeyboard')],
            ])
        )
        lastMessageId = message.message_id
        return
    }

    const rate = response.data.price.slice(0,10)

    ctx.reply(`Currency rate(${currencyName}):
        \n1 ${currencyName} = ${rate} USDT
        \n${getKyivDayTime()}`, 
        Markup.inlineKeyboard([[Markup.button.callback('🔙Back', 'Cryptocurrency Rates')]])
    )
})

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

//Start action
bot.start((ctx) => {
    const {first_name, last_name, username} = ctx.message.from

    replyToUser = `Hello ${first_name != null ? first_name + ' ' : ''}${last_name != null ? last_name + ' ' : ''}${username != null ? '(@' + username + ')!' : ''}`

    ctx.reply(`${replyToUser}\nNow ${getKyivDayTime()}. Kyiv\nWhat do you want to do?`)
    
    showReplyKeyboard(ctx)
})

//Bot launch
bot.launch()

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))