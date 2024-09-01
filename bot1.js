const TelegramBot = require('node-telegram-bot-api');
const dotenv = require('dotenv').config();
const mongoose = require('mongoose');
const { _message, userfinder, key, generateAut } = require('./messageFunctions/botfunction');
const User = require('./models/userModel');
const {handle_message} = require('./messageFunctions/message');
const handle_callback_data = require('./messageFunctions/callBackData');
const State = require('./models/statesModel');
const { getUserStateFromDB } = require('./states');
const { protect, deleteOldMessages } = require('./middleware/authMiddleware');

mongoose.connect(process.env.MONGO_URI).then(() => {
    try {
        const bot = new TelegramBot('7485778029:AAHb3yymLQt1HSBllQcrCVrgUTqRuKU4iN8', { polling: true });
        console.log("Bot is running...", process.env.TOKEN);
        setInterval(() => {
            deleteOldMessages(bot);
        }, 24 * 60 * 60 * 1000); // Runs every day
        bot.on('new_chat_members', (msg) => {
            const chatId = msg.chat.id;
            bot.sendMessage(chatId, _message);
        });
        
        bot.on('callback_query', async (query) => {
            const chatId = query.message.chat.id;
            const messageId = query.message.message_id;
            const data = query.data;
            console.log(chatId, messageId)
            const verified = await protect(bot, 'callback_query', chatId);
            if (verified.status === true) {                
                await handle_callback_data(bot, data, messageId, chatId);
            }
        });
    
        bot.on('message', async (msge) => {
            const verified = await protect(bot, msge.text, msge.chat.id);
            console.log(verified)
            
            if (verified.status === true) {
                await handle_message(bot, msge);
            }

        });
    
        bot.on('polling_error', (error) => {
            console.error('Polling error:', error.code, '\n', error.message, '\n', /*error.stack*/);
        });
    } catch (error) {
        console.log('Error:\n', error.message)
    }
        
});
