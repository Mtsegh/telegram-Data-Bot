const Admin = require("./admin");
const { findServicePlanText, mtn_plans } = require("./botfunction");
const { getTransaction } = require("../controllers/userController");
const { updateUserState, getUserStateFromDB } = require("../states");
const User = require("../models/userModel");
const editMessage = require("./sender");
const forms = require("../api/Data_Plans");

const callback_default = async (bot, data, parsedData, chatId, messageId) => {
    const state = await getUserStateFromDB(chatId);
    const user = await User.findOne({ telegramId: chatId })
    if (parsedData) {
        if (parsedData.type === 'airtimeOpt') {
            await editMessage(bot, "Enter Receiver's Phone Number", {
                chat_id: chatId,
                message_id: messageId,
                reply_markup: JSON.stringify({
                    inline_keyboard: [
                        [{ text: 'Cancel', callback_data: 'mainMenu' }],
                    ],
                }),
            }).then(async(editedMessage) => {
                await updateUserState(chatId, { plan_id: parsedData.value, isPhone: true, isAirtime: false, textValue: findServicePlanText(parsedData.value, state.network_id), msgId: editedMessage.message_id });
                // console.log('Last message ID:', msgId);
            })
            
        } else if (parsedData.type === 'receipt') {
            const userId = user.admin ? state.bugAccountId : chatId;
            try {
                getTransaction(userId, parsedData.value).then(async(receipt) => {
                    const options = { reply_markup: { inline_keyboard: [ [{ text: 'Download Receipt', callback_data: 'del' }], [{ text: 'Verify Transaction', callback_data: 'verify' }], [{ text: '🔙 Back', callback_data: 'history' }] ] } };
                    await editMessage(bot, `Transaction Date: ${receipt.date}\n\nReference Id: ${receipt.referenceId}\n${receipt.type}: ${receipt.description}\nNetwork: ${receipt.provider}\nAmount: ${receipt.amount}\nStatus: ${receipt.status}Date: `, {
                        chat_id: chatId,
                        message_id: state.msgId,
                        reply_markup: options.reply_markup,
                    })
                    
                });
            } catch (error) {
                await errorHandler(bot, chatId, state.msgId, `Network error. Try again.`, stringify([[option('Contact', json({ type: 'contact', value: 'buy' }))], [option('🔙 Back', 'option2')]]));
            }
            
        } else if (parsedData.type === 'admin') {
            await Admin(bot, chatId, parsedData.user, parsedData.action);
            
        } else if (parsedData.type === 'contact') {
            switch (parsedData.value) {
                case 'buy':
                    await updateUserState(chatId, { bug: true, msgId: messageId, bugType: 'purchase' });
                    editMessage(bot, "Write in detail the fault you encountered", {
                        chat_id: chatId,
                        message_id: messageId,
                        reply_markup: JSON.stringify({
                            inline_keyboard: [
                                [{ text: 'Cancel', callback_data: 'mainMenu' }],
                            ],
                        }),
                    });
                    break;
                    
                case 'manualTrans':
                    await updateUserState(chatId, { bug: true, msgId: messageId, bugType: 'Manual Deposit' });
                    editMessage(bot, "Reply with your bank name and the amount you sent.", {
                        chat_id: chatId,
                        message_id: messageId,
                        reply_markup: JSON.stringify({
                            inline_keyboard: [
                                [{ text: 'Cancel', callback_data: 'mainMenu' }],
                            ],
                        }),
                    });
                    break;
                case 'autoTrans':
                    await updateUserState(chatId, { bug: true, msgId: messageId, bugType: 'Automated Deposit' });
                    editMessage(bot, "Sorry for the inconvenience. Reply with the amount you sent and the day you sent it.", {
                        chat_id: chatId,
                        message_id: messageId,
                        reply_markup: JSON.stringify({
                            inline_keyboard: [
                                [{ text: 'Cancel', callback_data: 'mainMenu' }],
                            ],
                        }),
                    });
                    break;
                case 'accountIssue':
                    await updateUserState(chatId, { bug: true, msgId: messageId, bugType: 'Account Issue' });
                    editMessage(bot, "Write in detail the poblem you are having with your account.", {
                        chat_id: chatId,
                        message_id: messageId,
                        reply_markup: JSON.stringify({
                            inline_keyboard: [
                                [{ text: 'Cancel', callback_data: 'mainMenu' }],
                            ],
                        }),
                    });
                    break;
                case 'support':
                    await updateUserState(chatId, { bug: true, msgId: messageId, bugType: 'Support' });
                    editMessage(bot, "How may we help you.", {
                        chat_id: chatId,
                        message_id: messageId,
                        reply_markup: JSON.stringify({
                            inline_keyboard: [
                                [{ text: 'Cancel', callback_data: 'mainMenu' }],
                            ],
                        }),
                    });
                    break;
        
                default:
                    console.log(parsedData.value)
                    await editMessage(bot, "Invalid selection. Please choose a valid option.", {
                        chat_id: chatId,
                        message_id: messageId,
                        reply_markup: JSON.stringify({
                            inline_keyboard: [
                                [{ text: 'Cancel', callback_data: 'mainMenu' }],
                            ],
                        }),
                    });
                    break;
            }
        }
        
    } else if (!isNaN(data) && data <= 500) { // Check if the data is a number and less than or equal to 500
        await updateUserState(chatId, { amount: data });
        if (state.isPhone && state.phone) {
            const options = {
                reply_markup: JSON.stringify({
                    inline_keyboard: [
                        [{ text: '🔙 Back', callback_data: 'airtimeOpt' }],
                        [{ text: 'Cancel Request', callback_data: 'option1'}],
                    ]
                })
            }    
        
            await editMessage(bot, `Confirm your request for ₦${data} Airtime to ${state.phone}:\nEnter your passcode to Pay ₦${data}`, {
                    chat_id: chatId,
                    message_id: messageId,
                    reply_markup: options.reply_markup,
            }).then(async()=>{
                await updateUserState(chatId, { auth: true, authaction: "airtime", isPhone: false })
            });
        };
    } else if (forms[data] || forms.mtn[data]) {
        //console.log(forms.mtn[mtn_plans[1]])
        try {
            if (forms[data]) {
                await updateUserState(chatId, { network_id: forms[data].Value });
            }
            
            if (state.isAirtime) {
                await updateUserState(chatId, { isAirtime: true, phone: null, isPhone: true, msgId: messageId })
                await editMessage(bot, "Enter Receiver's Phone Number", {
                    chat_id: chatId,
                    message_id: messageId,
                    reply_markup: JSON.stringify({
                        inline_keyboard: [
                            [{ text: 'Cancel', callback_data: 'mainMenu' }],
                        ],
                    }),
                }); 
                return;           
            }
            const servicePlans = 
            data === 'mtn' 
            ? 
            mtn_plans.map(plan => ({
                text: `MTN ${forms.mtn[plan].Service_Type}`,
                callback_data: plan
            }))
            :
            forms.mtn[data]
            ?
            forms.mtn[data].Data_Plan.map(plan => ({
                text: plan.InnerText,
                callback_data: JSON.stringify({
                    type: "airtimeOpt",
                    value: plan.Value,
                })
            }))
            :
            forms[data].Data_Plan.map(plan => ({
                text: plan.InnerText,
                callback_data: JSON.stringify({
                    type: "airtimeOpt",
                    value: plan.Value,
                })
            }));
            
            servicePlans.push({ text: '🔙 Back', callback_data: 'option1' });
        
            const options = {
                reply_markup: JSON.stringify({
                    inline_keyboard: servicePlans.map(plan => [{ text: plan.text, callback_data: plan.callback_data }])
                })
            };
        
            await editMessage(bot, 'Select Data plan:', {
                chat_id: chatId,
                message_id: messageId,
                reply_markup: options.reply_markup,
            });
        } catch (error) {
            
        }
    } else {
        console.log(data)
        await editMessage(bot, "Invalid selection. Please choose a valid option.", {
            chat_id: chatId,
            message_id: messageId,
            reply_markup: JSON.stringify({
                inline_keyboard: [
                    [{ text: 'Cancel', callback_data: 'mainMenu' }],
                ],
            }),
        });
        
    }
    
}

module.exports = callback_default;