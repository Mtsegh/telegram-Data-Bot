const mongoose = require('mongoose');

const contactSchema = mongoose.Schema({
    chatId: {
        type: String,
        required: true
    },
    contactId: {
        type: String,
        required: true
    },
    msgId: {
        type: Object,
        required: true
    },
    timestamp: {
        type: Date,
        required: true,
        default: Date.now
    }
});

const Contact = mongoose.model('Contact', contactSchema);

module.exports = Contact;