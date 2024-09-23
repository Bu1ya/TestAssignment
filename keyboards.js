const { Markup } = require('telegraf');

const replyKeyboard = Markup.keyboard([['📈 Cryptocurrency Rates', '🌤️ Weather']]).resize().oneTime()

const weatherListKeyboard = Markup.inlineKeyboard([
    [Markup.button.callback('🇺🇦 Kyiv', 'Kyiv:WEATHER')],
    [Markup.button.callback('🇬🇧 London', 'London:WEATHER')],
    [Markup.button.callback('🇵🇱 Warsaw', 'Warsaw:WEATHER')],
    [Markup.button.callback('🔙 Back', 'ShowReplyKeyboard')],
])

const currencyListKeyboard = Markup.inlineKeyboard([
    [Markup.button.callback('₿ Bitcoin', 'BTC:CURRENCY')],
    [Markup.button.callback('Ξ Ethereum', 'ETH:CURRENCY')],
    [Markup.button.callback('🔙Back', 'ShowReplyKeyboard')],
])

const unexpectedErrorKeyboard = Markup.inlineKeyboard([
    [Markup.button.callback('🔙Return', 'ShowReplyKeyboard')],
])

const backToCurrencyKeyboard = Markup.inlineKeyboard([
    [Markup.button.callback('💶 Another currency', 'Cryptocurrency Rates')],
    [Markup.button.callback('🔙Return', 'ShowReplyKeyboard')]
])

const backToWeatherKeyboard = Markup.inlineKeyboard([
    [Markup.button.callback('🌍 Another location', 'Weather')],
    [Markup.button.callback('🔙Return', 'ShowReplyKeyboard')]
])

Markup.inlineKeyboard([
    [Markup.button.callback('₿ Bitcoin', 'BTC:CURRENCY')],
    [Markup.button.callback('Ξ Ethereum', 'ETH:CURRENCY')],
    [Markup.button.callback('🔙Back', 'ShowReplyKeyboard')],
])


module.exports = {
    replyKeyboard,
    weatherListKeyboard,
    currencyListKeyboard,
    unexpectedErrorKeyboard,
    backToCurrencyKeyboard,
    backToWeatherKeyboard
}