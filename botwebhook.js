const TelegramBot = require('node-telegram-bot-api');
const dotenv = require('dotenv').config();
const mongoose = require('mongoose');
const express = require('express');
const bodyParser = require('body-parser');
const { handle_message } = require('./messageFunctions/message');
const handle_callback_data = require('./messageFunctions/callBackData');
const { protect, deleteOldMessages } = require('./middleware/authMiddleware');

// MongoDB connection
mongoose.connect(process.env.MONGO_URI).then(() => {
    try {
        // Initialize Express app
        const app = express();
        app.use(bodyParser.json()); // Parse JSON bodies

        // Initialize the Telegram bot without polling
        const bot = new TelegramBot(process.env.TOKEN, {
            webHook: true,  // Enable webhook mode
        });// No polling here
        console.log("Bot is running with webhook...");

        // Set webhook URL (this should be your publicly accessible URL)
        const webhookUrl = `${process.env.WEBHOOK_URL}/bot${process.env.TOKEN}`;
        bot.setWebHook(webhookUrl)
            .then(() => {
                console.log(`Webhook set to: ${webhookUrl}`);
            })
            .catch((error) => {
                console.error('Failed to set webhook:', error.message);
            });

        // Set up route to handle webhook
        console.log(`/bot${process.env.TOKEN}`)
            
        app.post(`/bot${process.env.TOKEN}`, (req, res) => {
            console.log(`/bot${process.env.TOKEN}`)
            bot.processUpdate(req.body); // Pass the update to Telegram bot instance
            res.sendStatus(200);
        });

        // Middleware to delete old messages every day
        setInterval(() => {
            deleteOldMessages(bot);
        }, 24 * 60 * 60 * 1000); // Runs every day

        // Handle callback queries
        bot.on('callback_query', async (query) => {
            const chatId = query.message.chat.id;
            const messageId = query.message.message_id;
            const data = query.data;
            console.log(chatId, messageId);
            const verified = await protect(bot, 'callback_query', chatId);
            if (verified.status === true) {
                await handle_callback_data(bot, data, messageId, chatId);
            }
        });
        
        bot.on('message', async (msge) => {
            const verified = await protect(bot, msge.text, msge.chat.id);
            console.log(verified);

            if (verified.status === true) {
                await handle_message(bot, msge);
            }
        });

        // Start the Express server
        const PORT = process.env.PORT || 3000;
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`, );
        });

    } catch (error) {
        console.log('Error:\n', error.message);
    }
});
