const TelegramBot = require('node-telegram-bot-api');
const dotenv = require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const {handle_message} = require('./messageFunctions/message');
const handle_callback_data = require('./messageFunctions/callBackData');
const { protect, deleteOldMessages } = require('./middleware/authMiddleware');

const MONGO_URI="mongodb+srv://mtseghnadooihom:mtseghnadooihom@merchant.mz3erpr.mongodb.net/TelegramDataBot?retryWrites=true&w=majority&appName=Merchant"

mongoose.connect(MONGO_URI, null).then(() => {
    try {
        const bot = new TelegramBot('7485778029:AAHb3yymLQt1HSBllQcrCVrgUTqRuKU4iN8', { polling: true });
        const app = express();
        app.use(bodyParser.json());
        const PORT = process.env.PORT || 80;

        app.get("/", (req, res) => {
            res.send("Home Page")
        });

        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });

        setInterval(() => {
            deleteOldMessages(bot);
        }, 24 * 60 * 60 * 1000); // Runs every day

        
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
