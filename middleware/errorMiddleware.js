const { option } = require("../messageFunctions/botfunction");
const { editMessage } = require("../messageFunctions/sender");

const defaultOpt = {
    reply_markup: JSON.stringify({
        inline_keyboard: [
            [option('Cancel', 'mainMenu')],
        ],
    }),
}
const errorHandler = async (bot, chatId, messageId, errorMessage, option) => {
    try {
        await editMessage(bot, `Error: ${errorMessage}`, {
            chat_id: chatId,
            message_id: messageId,
            reply_markup: option.reply_markup ? option.reply_markup : defaultOpt.reply_markup,
        });
    } catch (error) {
        console.error('Error handling the error:', error);
    }
};

module.exports = errorHandler