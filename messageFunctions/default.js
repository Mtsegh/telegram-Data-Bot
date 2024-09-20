const { findServicePlanText, mtn_plans, option, stringify } = require("./botfunction");
const { getTransaction } = require("../controllers/userController");
const { updateUserState, getUserStateFromDB } = require("../controllers/stateController");
const User = require("../models/userModel");
const forms = require("../api/Data_Plans");
const { editMessage, sendMessage } = require("./sender");
const { Admin } = require("./admin");
const { receiptFormat } = require("./msgoptions");
const errorHandler = require("../middleware/errorMiddleware");

const callback_default = async (bot, data, parsedData, chatId, messageId) => {
    const state = await getUserStateFromDB(chatId);
    const user = state?.reqUser||{};
    if (parsedData) {
        if (parsedData.type === 'airtimeOpt') {
            editMessage(bot, "Enter Receiver's Phone Number", {
                chat_id: chatId,
                message_id: messageId,
                reply_markup: JSON.stringify({
                    inline_keyboard: [
                        [{ text: 'Cancel', callback_data: 'mainMenu' }],
                    ],
                }),
            }).then(async() => {
                await updateUserState(chatId, { plan_id: parsedData.value, isPhone: true, isAirtime: false, textValue: findServicePlanText(parsedData.value, state.network_id), msgId: messageId });
                // console.log('Last message ID:', msgId);
            })
            
        } else if (parsedData.type === 'receipt') {
            const userId = user.admin && state.contact.telegramId ?  state.contact.telegramId : chatId;
            try {
                getTransaction(userId, parsedData.value).then(async(receipt) => {
                    const info = receiptFormat('', receipt);
                    updateUserState(chatId, { ref: info.forReceipt })
                    const options = stringify([
                        [option('Download Receipt', 'download')],
                        [option('Verify Transaction', 'verify')],
                        [option('🔙 Back', 'history')]
                    ]);
                    await editMessage(bot, info.message, {
                        chat_id: chatId,
                        message_id: state.msgId,
                        reply_markup: options.reply_markup,
                    })
                    
                });
            } catch (error) {
                await errorHandler(bot, chatId, state.msgId, `Network error. Try again.`, stringify([[option('Contact', json({ type: 'contact', value: 'buy' }))], [option('🔙 Back', 'option2')]]));
            }
            
        } else if (parsedData.type === 'admin' && user?.admin) {
            if (!user?.accountstatus) {
                await errorHandler(bot, chatId, state.msgId, `Your account has been suspended contact Admin.`, { contact: 'support', back: 'contactUs' }, false);
                //return;
            }
            let contact
            if (state?.contact?.telegramId!==parsedData.user) {
                contact = await User.findOne({ telegramId: parsedData.user });
            } else {
                contact = state.contact
            }
            await Admin(bot, chatId, contact, parsedData.action);
            return
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
        try {
            // Update the user's state with the network ID if available
            if (forms[data]) {
                await updateUserState(chatId, { network_id: forms[data].Value });
            }
            console.log(data);
            
            // Handle the airtime option if state.isAirtime is true
            if (state.isAirtime) {
                await updateUserState(chatId, { phone: null, isPhone: true, msgId: messageId });
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
    
            // Determine service plans based on the data and network type
            const servicePlans = data === 'mtn'
                ? mtn_plans.map(plan => ({
                    text: `MTN ${forms.mtn[plan].Service_Type}`,
                    callback_data: plan
                }))
                : (forms.mtn[data] || forms[data])?.Data_Plan.map(plan => ({
                    text: plan.InnerText,
                    callback_data: JSON.stringify({
                        type: "airtimeOpt",
                        value: plan.Value,
                    })
                })) || [];
    
            // Add a "Back" option to the service plans
            servicePlans.push({ text: '🔙 Back', callback_data: forms[data]?'dataOpt':'mtn' });
    
            // Prepare the options for the inline keyboard
            const options = {
                reply_markup: JSON.stringify({
                    inline_keyboard: servicePlans.map(plan => [{ text: plan.text, callback_data: plan.callback_data }])
                })
            };
    
            // Edit the message to display the service plans
            await editMessage(bot, 'Select Data plan:', {
                chat_id: chatId,
                message_id: messageId,
                reply_markup: options.reply_markup,
            });
    
        } catch (error) {
            console.error('Error processing data:', error);
            // Handle error if needed, like sending an error message to the user
        }
    } else if (/^bug_+\d/.test(data)||/^receipt_+\d/.test(data)) {
            if (/^bug_+\d/.test(data)) {
                await Contactadmin.update(data.split('_')[1])
            } else {
                try {
                    sendMessage(bot, chatId, 'Loading details...').then(async(msg) => {
                        const receipt = await verify(data.split('_')[1]);
                        const detail = JSON.stringify(receipt, null, '\n')
                        
                            if (detail.error) {
                                await errorHandler(bot, chatId, msg, detail.error, { admin: chatId, back: 'API' }, true);
                            } else {              
                                await editMessage(bot, `Details: ${detail}`, {
                                    chat_id: chatId,
                                    message_id: msg,
                                    reply_markup: options.reply_markup
                                });
                            }
                    })
                } catch (error) {
                    console.error(error);
                    await errorHandler(bot, chatId, state.msgId, `Please /refresh and try again`, {}, false);
                }
            }

    } else {
        // Handle invalid data selection
        console.log('Invalid data:', data);
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