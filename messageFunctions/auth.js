const { updateUserState, getUserStateFromDB, resetUserState } = require("../controllers/stateController");
const User = require("../models/userModel");
const { makePurchase, makeDeposit } = require("../controllers/userController");
const { menu, callback, stringify, getValidity, parseInput } = require("./botfunction");
const { setAdmin,  changeUserStatus, search } = require("../controllers/adminController");
const errorHandler = require("../middleware/errorMiddleware");
const { sendMessage, editMessage, deleteMessage } = require("./sender");
const { receiptOpt, receiptFormat, editMsgInfo } = require("./msgoptions");
const { api_airtory, api_datory, api_user, verify } = require("../api/api");
const service = ['data', 'airtime'];
    
const secured = async(bot, authaction, chatId, msgId) => {
    const state = await getUserStateFromDB(chatId)
    const user = state?.reqUser || {};
    const userId = user?.admin && state?.contact?.telegramId ? state?.contact?.telegramId : chatId;
    if (user.accountstatus === 'susended') {
        await errorHandler(bot, chatId, state.msgId, `Your account has been suspended contact Admin.`, { contact: 'buy', back: 'contactUs', admin: state.contact.telegramId }, false);
        return;
    }
    if (authaction==="buydata") {
        try {
            editMessage(bot, 'Transaction processing...', {chat_id: chatId, message_id: msgId}).then(async() => {
                const info = { amount: state.amount, network_id: state.network_id, plan_id: state.plan_id, 
                    purchase: 'Data Purchase', validity: getValidity(state.textValue), phone: state.phone }
                
                makePurchase(userId, service[0], info).then(async(buy) => {
                    if (buy.message||buy.error) {
                        await errorHandler(bot, chatId, state.msgId, buy.message||buy.error, { contact: 'buy', back: 'dataOpt', admin: state.contact.telegramId }, user.admin);
                    } else {                        
                        const detail = receiptFormat(buy.success,  buy.newHistory);
                        updateUserState(chatId, { ref: detail.receiptFormat  })
                        await editMessage(bot, detail.message, {
                            chat_id: chatId,
                            message_id: state.msgId,
                            reply_markup: receiptOpt.reply_markup,
                        })
                    }
                })
            });
        } catch (error) {
            await errorHandler(bot, chatId, state.msgId, `Transaction failed. Try again.\nIf issue persists contact admin`, { contact: 'buy', back: 'dataOpt', admin: state.contact.telegramId }, user.admin);
        }
    } else if (authaction==="airtime") {
        try {
            editMessage(bot, 'Transaction processing...', {chat_id: chatId, message_id: msgId});
            const info = { amount: state.amount, network_id: state.network_id, purchase: 'Airtime Purchase', validity: 'VTU', phone: state.phone }
            makePurchase(userId, service[1], info).then(async(buy) => {
                if (buy.message||buy.error) {
                    await errorHandler(bot, chatId, state.msgId, buy.message||buy.error, { contact: 'buy', back: 'dataOpt', admin: state.contact.telegramId }, user.admin);
                } else {
                    const detail = receiptFormat(buy.success, buy.newHistory);
                    updateUserState(chatId, { ref: detail.forReceipt })
                    await editMessage(bot, detail.message, {
                        chat_id: chatId,
                        message_id: state.msgId,
                        reply_markup: receiptOpt.reply_markup,
                    })
                }
            });
        } catch (error) {
            await errorHandler(bot, chatId, state.msgId, `Transaction failed. Try again.\nIf issue persists contact admin`, { contact: 'buy', back: 'airtimeOpt', admin: userId });
        }
    }
}

const Adminauth = async(bot, admin, TId, action) => {
    console.log('admin, TId, action', admin, TId, action);
    const state = await getUserStateFromDB(admin);
    deleteMessage(bot, admin, state.msgId)
    switch (action) {
        case 'suspend':
            try {
                await sendMessage(bot, admin, 'Changing user status...').then(async(msg) => {
                    await changeUserStatus(TId).then(async(status) => {
                        if (status.message||status.error) {
                            await errorHandler(bot, admin, msg, status.message||status.error, { admin: TId, back: 'getUser' }, true);
                        } else {                        
                            await editMessage(bot, `${status.success}`, {
                                chat_id: admin,
                                message_id: msg,
                                reply_markup: JSON.stringify({
                                    inline_keyboard: [
                                        [callback(status.text, TId, "toVerify")],
                                        [menu(admin)],
                                    ]
                                })
                            });
                        }
                    })
                });
            } catch (error) {
                console.error(error);
                await errorHandler(bot, admin, state.msgId, `Please /refresh and try again`, {}, false);
            }
            break;
    
        case 'userDeposit':
            try {
                await sendMessage(bot, admin, 'Updating user balance...').then(async(msg) => {
                    const info = { amount: state.textValue, status: 'completed'}
                    makeDeposit(TId, 'Manual', info).then(async(deposit) => {
                        if (deposit.message||deposit.error) {
                            await errorHandler(bot, admin, msg, deposit.message||deposit.error, { admin: TId, back: 'getUser' }, true);
                        } else {                        
                            await editMessage(bot, `${deposit.success}`, {
                                chat_id: admin,
                                message_id: msg,
                                reply_markup: JSON.stringify({
                                    inline_keyboard: [
                                        [callback('Transaction', TId, "tranx")],
                                        [callback(deposit.text, TId, "suspend")],
                                        [menu(admin)],
                                    ]
                                })
                            });
                        }
                    })
                });
            } catch (error) {
                console.error(error);
                await errorHandler(bot, admin, state.msgId, `Please /refresh and try again`, {}, false);
            }
            break;
            
        case 'makeAdmin':
            try {
                await sendMessage(bot, admin, `Changing user admin status...`).then((msg) => {
                    setAdmin(TId).then(async(make) => {
                        
                        if (make.message||make.error) {
                            await errorHandler(bot, admin, msg, `${make.message||make.error}`, { admin: TId, back: 'getUser' }, true)
                            return;
                        }
                        await editMessage(bot, make.success, {
                            chat_id: admin,
                            message_id: msg,
                            reply_markup: JSON.stringify({
                                inline_keyboard: [
                                    [callback(make.text, TId, "makeAdmin")],
                                    [menu(admin)],
                                ],
                            }),
                        })
                        await updateUserState(admin, { retry: false })
                    });
                });
            } catch (error) {
                console.error(error);
                await errorHandler(bot, admin, state.msgId, `Please /refresh and try again`, {}, false);
            }
            break;
    
        case 'chat':
            try {
                const send = await sendMessage(bot, TId, `Admin message: ${state.textValue}`)
                const msg = send ? 'Message sent successfully' : 'Unble to send message. Try again.';
                await editMessage(bot, msg, {
                    chat_id: admin,
                    message_id: state.msgId,
                    reply_markup: JSON.stringify({
                        inline_keyboard: [
                            [callback('🔙 Back', TId, "getUser")],
                            [menu(admin)],
                        ],
                    }),
                })
                await updateUserState(admin, { retry: false });
            } catch (error) {
                console.error(error);
                await errorHandler(bot, admin, state.msgId, `Please /refresh and try again`, {}, false);
            }
            break;
        
        default:
            if (action==='api_airtory' || action==='api_datory') {
                try {
                    await sendMessage(bot, admin, `Loading API history...`).then(async(msg) => {
                        const history = action==='api_airtory' ? await api_airtory() : await api_datory();
                        if (history.message||history.Error) {
                            await errorHandler(bot, admin, msg, `${history.message||history.Error}`, { admin: TId, back: 'getUser' }, true)
                            return;
                        }
                        console.log(history);
                        
                        const historyOpt = history.map(tory => ({
                            text: `${tory.service} ${tory.amount}`,
                            callback_data: `receipt_${tory.id}`
                        }));
                        historyOpt.push(menu(admin));
                        
                        const options = stringify(historyOpt.map(tory => [{ text: tory.text, callback_data: tory.callback_data }]));
                        await editMessage(bot, "Here's a list of all API transactions", {
                                chat_id: admin,
                                message_id: msg,
                                reply_markup: options.reply_markup,
                        })
                        updateUserState(admin, { retry: false });
                    });
                    
                } catch (error) {
                    console.error(error);
                    await errorHandler(bot, admin, state.msgId, `Please /refresh and try again`, {}, false);
                }
            } else if (action === 'api_user') {
                
                try {
                    await sendMessage(bot, admin, `Loading user details...`).then(async(msg) => {
                        const userdetails = await api_user();
                        await editMessage(bot, `Details: ${userdetails}`, {
                                chat_id: admin,
                                message_id: msg,
                                reply_markup: options.reply_markup,
                        })
                        updateUserState(admin, { retry: false });
                    });
                    
                } catch (error) {
                    console.error(error);
                    await errorHandler(bot, admin, state.msgId, `Please /refresh and try again`, {}, false);
                } 
            } else {                
                console.log(action)
                await errorHandler(bot, admin, state.msgId, "Invalid selection. Please choose a valid option.", null, true)
            }
            break;
    }
}

const searchUser = async (bot, admin) => {

    try {
        const state = await getUserStateFromDB(admin);
        await sendMessage(bot, admin, 'Searching user...').then(async (msg) => {
            const parsed = parseInput(state.textValue)
            const result = await search(parsed);
    
            if (result.message||result.error) {
                // Handle the case where no users are found
                await errorHandler(bot, admin, msg, result.message||result.error, { admin: admin, back: 'allUser' }, true);
            } else {
                // Handle the case where users are found
                const inlineKeyboard = result.map(user => ([{
                    text: `${user.name} ${user.telegramId}`,
                    callback_data: JSON.stringify({
                        type: "admin",
                        user: user.telegramId,
                        action: "getUser",
                    })
                }]));
    
                await editMessage(bot, 'Here are all the users that match your criteria:', {
                    chat_id: admin,
                    message_id: msg,
                    reply_markup: JSON.stringify({
                        inline_keyboard: inlineKeyboard
                    })
                });
            }
        });
    } catch (error) {
        console.error(error);
        await errorHandler(bot, admin, state.msgId, `Please /refresh and try again`, {}, false);
    }

}

module.exports = {
    secured,
    Adminauth,
    searchUser
};