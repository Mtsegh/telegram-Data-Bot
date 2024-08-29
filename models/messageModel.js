const mongoose = require('mongoose');

const messageSchema = mongoose.Schema({
    chatId: {
        type: String,
        required: true
    },
    messageId: {
        type: Number,
        required: true
    },
    timestamp: {
        type: Date,
        required: true,
        default: Date.now
    }
});

const Message = mongoose.model('Message', messageSchema);

module.exports = Message;