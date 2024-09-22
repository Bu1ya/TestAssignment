[1mdiff --git a/bot.js b/bot.js[m
[1mindex 9fb9a49..16be5d5 100644[m
[1m--- a/bot.js[m
[1m+++ b/bot.js[m
[36m@@ -60,13 +60,13 @@[m [mconst showCryptocurrencyList = async (ctx) => {[m
     };[m
     [m
 [m
[31m-bot.action('ShowReplyKeyboard', (ctx) => showReplyKeyboard(ctx));[m
[32m+[m[32mbot.action('ShowReplyKeyboard', showReplyKeyboard);[m
 [m
[31m-bot.action(['Weather'], (ctx) => showWeatherList(ctx))[m
[31m-bot.hears(['🌤️ Weather'], (ctx) => showWeatherList(ctx))[m
[32m+[m[32mbot.action(['Weather'], showWeatherList)[m
[32m+[m[32mbot.hears(['🌤️ Weather'], showWeatherList)[m
 [m
[31m-bot.action(['Cryptocurrency Rates'], (ctx) => showCryptocurrencyList(ctx))[m
[31m-bot.hears(['📈 Cryptocurrency Rates'], (ctx) => showCryptocurrencyList(ctx))[m
[32m+[m[32mbot.action(['Cryptocurrency Rates'], showCryptocurrencyList)[m
[32m+[m[32mbot.hears(['📈 Cryptocurrency Rates'], showCryptocurrencyList)[m
 [m
 //Main weather location fetch action[m
 bot.action(/(.+):WEATHER/, async (ctx) =>{[m
