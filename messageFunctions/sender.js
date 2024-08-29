const { updateUserState } = require("../states");
const getReceipt = require("../utils/receiptmaker");
const { option } = require("./botfunction");

/**
 * Edits a message with the given text and details, and handles errors.
 * @param {Object} bot - The bot instance used to edit the message.
 * @param {string} text - The new text for the message.
 * @param {Object} details - The details required to edit the message.
 * @returns {Promise} - A promise that resolves when the message is edited or rejects if there's an error.
 */
async function editMessage(bot, text, details) {
    try {
        await bot.editMessageText(text, details);
        console.log('Message edited successfully');
    } catch (error) {
        await sendMessage(bot, details.chat_id, text, details.reply_markup);
        console.error('Error editing message:', {
            text,
            details,
            error: error.message || error
        });
    }
}

/**
 * Sends a message with the given text and details, and handles errors.
 * @param {Object} bot - The bot instance used to send the message.
 * @param {string} chatId - The chat_id of the message receiver.
 * @param {string} text - The new text for the message.
 * @param {Object} option - The inline keyboard options of the message.
 * @returns {Promise} - A promise that resolves when the message is set or rejects if there's an error.
 */
async function sendMessage(bot, chatId, text, option) {
    try {
        await bot.sendMessage(chatId, text, option).then(async(msg) => {
            await updateUserState(chatId, { msgId: msg.message_id })
            console.log('Message sent successfully');
            return msg.message_id
        });
    } catch (error) {
        console.error('Error sending message:', {
            text,
            option,
            error: error.message || error
        });
    }
}


/**
 * Edits a message with the given text and details, and handles errors.
 * @param {Object} bot - The bot instance used to delete the message.
 * @param {string} chatId - The chat_id of the user.
 * @param {string} messageId - The message id of the message to delete.
 * @returns {Promise} - A promise that resolves when the message is deleted or rejects if there's an error.
 */
async function deleteMessage(bot, chatId, messageId) {
    try {
        await bot.deleteMessage(chatId, messageId);
        console.log('Message deleted successfully');
    } catch (error) {
        console.error('Error deleting message:', {
            chatId,
            messageId,
            error: error.message || error
        });
    }
}

async function sendPhoto(bot, detail, chatId) {
    try {
        await getReceipt(chatId, detail)
        const photo = `../userReceipt/${chatId}.jpg`;
        await bot.sendPhoto(chatId, photo, stringify([[option('🔙 Back', 'history')], [option('Main Menu', 'mainMenu')] ]));
        console.log('Receipt sent successfully');
    } catch (error) {
        console.error('Error sending receipt:', {
            chatId,
            error: error.message || error
        });
    }
}


module.exports = {
    editMessage,
    sendMessage,
    deleteMessage,
    sendPhoto
}