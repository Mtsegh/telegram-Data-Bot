const { stringify, option, dateformat } = require("./botfunction");

const receiptOpt = stringify([
    [option('Download Receipt', 'download')],
    [option('Contact', JSON.stringify({ type: 'contact', value: 'buy' }))],
    [{ text: '🔙 Back', callback_data: 'history' }]
]);

const receiptFormat = (success, buy) => {
    const forReceipt = {refid: buy.referenceId, type: buy.type, quantity: buy.description, network: buy.provider, amount: buy.amount, status: buy.status, date: dateformat(buy.createdAt) };
    return { forReceipt: forReceipt, message: `${success+'\n'}Transaction Info\nTransaction Date: ${dateformat(buy.createdAt)}\nReference Id: ${buy.referenceId}\n${buy.type}: ${buy.description}\nNetwork: ${buy.provider}\nAmount: ${buy.amount}\nStatus: ${buy.status}` }
}

const AirtimeAmounts = stringify([
    [{ text: '₦50', callback_data: '50' }],
    [{ text: '₦100', callback_data: '100' }],
    [{ text: '₦150', callback_data: '150' }],
    [{ text: '₦200', callback_data: '200' }],
    [{ text: '₦250', callback_data: '250' }],
    [{ text: '₦300', callback_data: '300' }],
    [{ text: '₦350', callback_data: '350' }],
    [{ text: '₦400', callback_data: '400' }],
    [{ text: '₦450', callback_data: '450' }],
    [{ text: '₦500', callback_data: '500' }],
    [{ text: '🔙 Back', callback_data: 'airtimeOpt' }]
]);
const editMsgInfo = (chatId, msgId) => {
    return {
        chat_id: chatId,
        message_id: msgId
    }
}

module.exports = {
    receiptOpt,
    receiptFormat,
    AirtimeAmounts,
    editMsgInfo
}