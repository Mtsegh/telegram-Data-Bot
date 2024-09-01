const User = require("../models/userModel");
const { updateUserState, getUserStateFromDB } = require("../states");
const { sendMessage, editMessage } = require("../messageFunctions/sender");
const Message = require("../models/messageModel");
const { sendMainMenu } = require("../messageFunctions/message");

const protect = async (bot, msg, TId) => {
    try {
        const user = await User.findOne({ telegramId: TId })
        const state = await getUserStateFromDB(TId);
            
        if (!user) {
            return { status: true, message: "User not found" };
        }
        const token = user.token
        console.log('Your token', token)
        
        if (state.signin) {
            if (msg === 'callback_query') {
                await editMessage(bot, 'Enter passcode to continue:', {
                    chat_id: TId,
                    message_id: state.msgId,
                })
                return { status: false };
            }
            if (msg === user.passcode) {
                await editMessage(bot, 'Logged in Successfully', {
                    chat_id: TId,
                    message_id: state.msgId,
                })
                user.token = user.admin ? Date.now() + 10*60*1000 : Date.now() + 86400000*2;
                await user.save();
                await updateUserState(TId, { signin: false });
                await sendMainMenu(bot, TId, state.msgId)
                return { status: false };
            }
            await editMessage(bot, 'Passcode not correct. Please try again.\nEnter passcode to continue:', {
                chat_id: TId,
                message_id: state.msgId,
            })
            return { status: false };
        }

        if (token <= Date.now()) {
            await updateUserState(TId, { signin: true })
            await editMessage(bot, "Not authorised, Enter passcode to continue.", {
                chat_id: TId,
                message_id: state.msgId,
            });
            return { status: false }
        } else {
            user.token = user.admin ? Date.now() + 10*60*1000 : Date.now() + 86400000*2;
            await user.save();
            return { status: true }
        }
        
    } catch (error) {
        console.error(error);
        
        return { status: false, message: 'An unexpected error occurred.\nContact Admin.'}
    }
    
};

const saveMessageData = async (msg) => {
    try {
        const { message_id, chat } = msg;
        const chatId = chat.id;

        const newMessage = new Message({
            chatId: chatId,
            messageId: message_id,
            timestamp: new Date()
        });

        await newMessage.save();
        console.log(`Message ${message_id} from chat ${chatId} saved.`);
    } catch (error) {
        console.error('Error saving message data:', error);
    }
};

// Usage: saveMessageData(bot, msg); inside your message handler.
const deleteOldMessages = async (bot) => {
    try {
        // Calculate the time threshold (20 hours ago)
        const thresholdTime = new Date(Date.now() - 30 * 24 * 60 * 60 * 6000);

        // Find messages older than 20 hours
        const oldMessages = await Message.find({ timestamp: { $lt: thresholdTime } });

        for (const message of oldMessages) {
            try {
                await bot.deleteMessage(message.chatId, message.messageId);
                console.log(`Deleted message ${message.messageId} from chat ${message.chatId}`);

                // Remove the message from the database after successful deletion
                await Message.deleteOne({ _id: message._id });
            } catch (error) {
                console.warn(`Failed to delete message ${message.messageId} from chat ${message.chatId}:`, error.message);
                // Continue to the next message without stopping the loop
            }
        }
    } catch (error) {
        console.error('Error deleting old messages:', error);
    }
};

// Schedule this function to run periodically using setInterval or a similar method.




module.exports = {
    protect,
    deleteOldMessages,
    saveMessageData
}