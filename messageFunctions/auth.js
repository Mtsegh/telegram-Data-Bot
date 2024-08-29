const Admin = require("./admin");
const { updateUserState, getUserStateFromDB, resetUserState } = require("../states");
const User = require("../models/userModel");
const { makePurchase } = require("../controllers/userController");
const { menu, callback, option, stringify, getValidity } = require("./botfunction");
const { search, getAllUsers, setAdmin } = require("../controllers/adminController");
const errorHandler = require("../middleware/errorMiddleware");
const { sendMessage, editMessage } = require("./sender");
const service = ['data', 'airtime'];
    
const secured = async(bot, authaction, chatId, msgId) => {
    try {
        const state = await getUserStateFromDB(chatId)
        console.log(bot, authaction, chatId, msgId);
        if (authaction==="buydata") {
            try {
                editMessage(bot, 'Transaction processing...', {chat_id: chatId, message_id: msgId}).then(async() => {
                    const info = { amount: state.amount, network_id: state.network_id, plan_id: state.plan_id, purchase: 'Data Purchase', validity: getValidity(state.textValue) }
                    makePurchase(chatId, service[0], info).then(async(buy) => {
                        if (buy.message||buy.error) {
                            await errorHandler(bot, chatId, state.msgId, `${buy.message||buy.error}\nIf issue persists contact admin`, stringify([[option('Contact', json({ type: 'contact', value: 'buy' }))], [option('🔙 Back', 'dataOpt')]]));
                        } else {                        
                            const options = { reply_markup: { inline_keyboard: [ [{ text: 'Download Receipt', callback_data: 'del' }], [option('Contact', json({ type: 'contact', value: 'buy' }))], [{ text: '🔙 Back', callback_data: 'history' }] ] } };
                            await editMessage(bot, `${buy.success}\nTransaction Info\nTransaction Date: ${buy.newHistory.date}\nReference Id: ${buy.newHistory.referenceId}\n${buy.newHistory.type}: ${buy.newHistory.description}\nNetwork: ${buy.newHistory.provider}\nAmount: ${buy.newHistory.amount}\nStatus: ${buy.newHistory.status}Date: `, {
                                chat_id: chatId,
                                message_id: state.msgId,
                                reply_markup: options.reply_markup,
                            })
                        }
                    })
                });
            } catch (error) {
                await errorHandler(bot, chatId, state.msgId, `Transaction failed. Try again.\nIf issue persists contact admin`, stringify([[option('Contact', json({ type: 'contact', value: 'buy' }))], [option('🔙 Back', 'dataOpt')]]));
            }
        } else if (authaction==="airtime") {
            try {
                editMessage(bot, 'Transaction processing...', {chat_id: chatId, message_id: msgId}).then(async() => {
                    const info = { amount: state.amount, network_id: state.network_id, purchase: 'Airtime Purchase', validity: 'Validated' }
                    makePurchase(chatId, service[1], info).then(async(buy) => {
                        if (buy.message||buy.error) {
                            await errorHandler(bot, chatId, state.msgId, `${buy.message||buy.error}\nIf issue persists contact admin`, stringify([[option('Contact', json({ type: 'contact', value: 'buy' }))], [option('🔙 Back', 'airtimeOpt')]]));
                        } else {                        
                            const options = { reply_markup: { inline_keyboard: [ [{ text: 'Download Receipt', callback_data: 'del' }], [option('Contact', json({ type: 'contact', value: 'buy' }))], [{ text: '🔙 Back', callback_data: 'mainMenu' }] ] } };
                            await editMessage(bot, `${buy.success}\nTransaction Info\nTransaction Date: ${buy.newHistory.date}\nReference Id: ${buy.newHistory.referenceId}\n${buy.newHistory.type}: ${buy.newHistory.description}\nNetwork: ${buy.newHistory.provider}\nAmount: ${buy.newHistory.amount}\nStatus: ${buy.newHistory.status}Date: `, {
                                chat_id: chatId,
                                message_id: state.msgId,
                                reply_markup: options.reply_markup,
                            })
                        }
                    })
                });
            } catch (error) {
                await errorHandler(bot, chatId, state.msgId, `Transaction failed. Try again.\nIf issue persists contact admin`, stringify([[option('Contact', json({ type: 'contact', value: 'buy' }))], [option('🔙 Back', 'airtimeOpt')]]));
            }
        } else {
            await errorHandler(bot, chatId, state.msgId, `Transaction failed. Try again.\nIf issue persists contact admin`, stringify([[option('Contact', json({ type: 'contact', value: 'buy' }))], [option('🔙 Back', 'option1')]]));
        }
    } catch (error) {
        await errorHandler(bot, chatId, state.msgId, `Transaction failed. Try again.\nIf issue persists contact admin`, stringify([[option('Contact', json({ type: 'contact', value: 'buy' }))], [option('🔙 Back', 'airtimeOpt')]]));
    }
}

const Adminauth = async(bot, admin, TId, action) => {
    console.log('admin, TId, action', admin, TId, action);
    
    switch (action) {
        case 'allUsers':
            sendMessage(bot, admin, 'Getting Users...').then(async(msg) => {
                getAllUsers(admin).then(async(users) => {
                    if (users.message||users.error) {
                        await errorHandler(bot, admin, msg, users.message||users.error, stringify([[menu(admin)]]));
                    } else {                        
                        const userOpt = users.map(user => ({
                            text: `${user.name} ${user.balance}`,
                            callback_data: JSON.stringify({
                                type: "admin",
                                user: user.telegramId,
                                action: "getUser",
                            })
                        }));
                        
                        userOpt.push(callback('Search User', TId, "search"),
                        menu(admin));
                    
                        const options = {
                            reply_markup: JSON.stringify({
                                inline_keyboard: userOpt.map(user => [{ text: user.text, callback_data: user.callback_data }])
                            })
                        };
                    
                        await editMessage(bot, 'Here are a list of all VB users', {
                            chat_id: admin,
                            message_id: msg,
                            reply_markup: options.reply_markup
                        });
                    }
                }).then(async() => {
                    await resetUserState(admin)
                });
            });
            break;

        case 'getUser':
            await bot.sendMessage(admin, 'Getting User info...').then(async(msg) => {
                await getUserInfo(admin, TId).then(async(info) => {
                    if (info.message||info.error) {
                        await errorHandler(bot, admin, msg, info.message||info.error, stringify([[callback('🔙 Back', admin, "allUsers")],[menu(admin)]]));
                    } else {                        
                        await editMessage(bot, `Heres the info AUT: ${info.AUT}, \nBalance: ${info.balance}, \nDetails: ${info.details}, \nTId: ${info.telegramId}`, {
                            chat_id: admin,
                            message_id: msg,
                            reply_markup: JSON.stringify({
                                inline_keyboard: [
                                    [callback('Transaction', TId, "tranx")],
                                    [callback('Update User balance', TId, "userDeposit")]
                                    [callback('Make Admin', TId, "makeAdmin")],
                                    [callback('Suspend', TId, "suspend")],
                                    [callback('Back', admin, "allUsers")],   
                                ]
                            })
                        });
                    }
                })
            });
            break;

        case 'suspend':
            await bot.sendMessage(admin, 'Suspending user...').then(async(msg) => {
                await changeUserStatus(admin, TId, 'suspend').then(async(status) => {
                    if (status.message||status.error) {
                        await errorHandler(bot, admin, msg, status.message||status.error, stringify([callback('🔙 Back', TId, "getUser")]));
                    } else {                        
                        await editMessage(bot, `User status changed to ${status}`, {
                            chat_id: admin,
                            message_id: msg,
                            reply_markup: JSON.stringify({
                                inline_keyboard: [
                                    [callback('Verify account', TId, "toVerify")],
                                    [menu(admin)],
                                ]
                            })
                        });
                    }
                })
            });
            break;
    
        case 'userDeposit':
            await sendMessage(bot, admin, 'Updating user balance...').then(async(msg) => {
                const info = { amount: state.amount, status: 'completed'}
                makeDeposit(TId, 'Manual', info).then(async(deposit) => {
                    if (deposit.message||deposit.error) {
                        await errorHandler(bot, admin, msg, deposit.message||deposit.error, stringify([[callback('🔙 Back', TId, "getUser")],[menu(admin)]]));
                    } else {                        
                        await editMessage(bot, `${deposit.success}`, {
                            chat_id: admin,
                            message_id: msg,
                            reply_markup: JSON.stringify({
                                inline_keyboard: [
                                    [callback('Transaction', TId, "tranx")],
                                    [callback('Suspend', TId, "suspend")],
                                    [menu(admin)],
                                ]
                            })
                        });
                    }
                })
            });
            break;
    
        case 'toVerified':
            await sendMessage(bot, admin, 'Verifying user...').then(async(msg) => {
                await changeUserStatus(admin, TId, 'verified').then(async(status) => {
                    if (status.message||status.error) {
                        await errorHandler(bot, admin, msg, status.message||status.error, stringify([[callback('🔙 Back', TId, "getUser")],[menu(admin)]]));
                    } else {                        
                        await editMessage(bot, `User status changed to ${status}`, {
                            chat_id: admin,
                            message_id: msg,
                            reply_markup: JSON.stringify({
                                inline_keyboard: [
                                    [callback('Transaction', TId, "tranx")],
                                    [callback('Suspend', TId, "suspend")],
                                    [callback('Finish', admin, "menu")],
                                ]
                            })
                        });
                    }
                })
            });
            break;   
            
        case 'search':
            await sendMessage(bot, admin, 'Verifying user...').then(async (msg) => {
                const result = await search(state.text);
        
                if (result.message) {
                    // Handle the case where no users are found
                    await editMessage(bot, result.message, {
                        chat_id: admin,
                        message_id: msg,
                        reply_markup: JSON.stringify({
                            inline_keyboard: [
                                [callback('🔙 Back', admin, "allUsers")]
                                [callback('Admin Menu', admin, "menu")],
                            ]
                        })
                    });
                } else if (result.error) {
                    // Handle the case where an error occurred
                    await editMessage(bot, `Error: ${result.error}`, {
                        chat_id: admin,
                        message_id: msg,
                        reply_markup: JSON.stringify({
                            inline_keyboard: [
                                [callback('Admin Menu', admin, "menu")],
                            ]
                        })
                    });
                } else {
                    // Handle the case where users are found
                    const inlineKeyboard = result.map(user => ([{
                        text: `User ${user.telegramId}`,
                        callback_data: `user_${user.telegramId}`
                    }]));
        
                    await bot.editMessageText('Here are all the users that match your criteria:', {
                        chat_id: admin,
                        message_id: msg.message_id,
                        reply_markup: JSON.stringify({
                            inline_keyboard: inlineKeyboard
                        })
                    });
                }
            });
            break;
            
        case 'makeAdmin':
            await updateUserState(admin, { buAccountId: TId })
            await sendMessage(bot, admin, `Removing User-${TId} from admin role...`).then((msg) => {
                setAdmin(TId, true).then(async(make) => {
                    
                    if (make.message||make.error) {
                        await errorHandler(bot, admin, msg, `${make.message||make.error}`, stringify([
                                [callback('🔙 Back', TId, "getUser")],
                                [menu(admin)],
                            ]))
                        return;
                    }
                    await editMessage(bot, make.success, {
                        chat_id: admin,
                        message_id: msg,
                        reply_markup: JSON.stringify({
                            inline_keyboard: [
                                [callback('🔙 Back', TId, "getUser")],
                                [menu(admin)],
                            ],
                        }),
                    })
                    await updateUserState(admin, { retry: false })
                });
            });
            break;
    
        case 'removeAdmin':
            await updateUserState(admin, { buAccountId: TId })
            await sendMessage(bot, admin, `Removing User-${TId} from admin role...`).then((msg) => {
                setAdmin(TId, false).then(async(remove) => {
                    
                    if (remove.message||remove.error) {
                        await errorHandler(bot, admin, msg, `${remove.message||remove.error}`, stringify([
                                [callback('🔙 Back', TId, "getUser")],
                                [menu(admin)],
                            ]))
                        return;
                    }
                    await editMessage(bot, remove.success, {
                        chat_id: admin,
                        message_id: msg,
                        reply_markup: JSON.stringify({
                            inline_keyboard: [
                                [callback('🔙 Back', TId, "getUser")],
                                [menu(admin)],
                            ],
                        }),
                    })
                    await updateUserState(admin, { retry: false })
                });
            });
        
                    
        break;
        
        default:
            console.log(action)
            await errorHandler(bot, admin, state.msgId, "Invalid selection. Please choose a valid option.", stringify([
                [menu(admin)],
            ]))
            break;
    }
}

module.exports = {
    secured,
    Adminauth
};