const callback_default = require("./default");
const { getUserHistory, verifyTransaction } = require("../controllers/userController");
const { sendDataFormsMenu, sendMainMenu } = require("./message");
const User = require("../models/userModel");
const { resetUserState, updateUserState, getUserStateFromDB } = require("../states");
const { editMessage, sendPhoto } = require("./sender");
const { dateformat, stringify, option, menu } = require("./botfunction");

const handle_callback_data = async (bot, data, messageId, chatId) => {
    // const chatId = chatId?chatId;
    let parsedData;
    // Attempt to parse JSON if it looks like JSON  
    if (typeof data === 'string' && data.startsWith('{') && data.endsWith('}')) {
        try {
            parsedData = JSON.parse(data);
        } catch (error) {
            console.error('Error parsing JSON:', error);
            return; // Exit if parsing fails
        }
    }
        
    const user = await User.findOne({telegramId:chatId});
    const state = await getUserStateFromDB(chatId);
    
    try {
        switch (data) {
            case 'option1':
                await resetUserState(chatId);
                await editMessage(bot, `Balance: ${user.balance}\nSelect a purchase option:`, {
                    chat_id: chatId,
                    message_id: messageId,
                    reply_markup: JSON.stringify({
                        inline_keyboard: [
                            [{ text: 'Buy Data', callback_data: 'dataOpt' }],
                            [{ text: 'Buy Airtime', callback_data: 'airtimeOpt' }],
                            [{ text: 'Make Deposit', callback_data: 'depositOpt' }],
                            [{ text: '🔙 Back', callback_data: 'mainMenu' }],
                        ],
                    }),
                });
                break;

            case 'dataOpt':
                await sendDataFormsMenu(bot, chatId, messageId);
                break;

            case 'option2':
                await editMessage(bot, 'Manage your account:', {
                    chat_id: chatId,
                    message_id: messageId,
                    reply_markup: JSON.stringify({
                        inline_keyboard: [
                            [option('Transaction History', 'history')],
                            [option('Login existing account', 'login')],
                            [option('Change Passcode', 'changepass')],
                            [option('Contact Us', JSON.stringify({
                                type: "contact",
                                value: 'accountIssue',
                            }))],
                            user.admin?[menu(chatId)]:[option('🔙 Back', 'mainMenu')]
                        ],
                    }),
                });
                break;

            case 'mainMenu':
                if (!user) {
                    
                }
                await resetUserState(chatId);
                await sendMainMenu(bot, chatId, messageId);
                break;

            case 'airtimeOpt':
                await updateUserState(chatId, { isAirtime: true })
                await sendDataFormsMenu(bot, chatId, messageId);
                break;

            case 'history':
                const userId = user.admin ? state.bugAccountId : chatId;
                getUserHistory(userId).then(async(history) => {
                    const inlineKeyboard = history.map(tranx => [
                        {
                            text: `${dateformat(tranx.updatedAt)}\n${tranx.description}`,
                            callback_data: JSON.stringify({ type: "receipt", value: tranx.referenceId })
                        }
                    ]);
            
                    // Add the 'Back' button
                    inlineKeyboard.push([
                        { text: '🔙 Back', callback_data: 'option2' }
                    ]);
            
                    // Create the reply_markup object
                    const options = {
                        reply_markup: JSON.stringify({
                            inline_keyboard: inlineKeyboard
                        })
                    };
                    await updateUserState(chatId, {ref: true})
                    await editMessage(bot, "Here are your recent transactions", {
                        chat_id: chatId,
                        message_id: messageId,
                        reply_markup: options.reply_markup,
                    });
                });
                break;

            case 'login':
                await updateUserState(chatId, { isAUT: true, msgId: messageId, login: true });
                await editMessage(bot, "Enter your Account Unique Token to login", {
                    chat_id: chatId,
                    message_id: messageId,
                    reply_markup: JSON.stringify({
                        inline_keyboard: [
                            [{ text: 'Cancel', callback_data: state.notuser?'signUser':'mainMenu' }],
                        ],
                    }),
                });
                break;

            case 'changepass':
                await updateUserState(chatId, { cpass: true, isAUT: true, msgId: messageId });
                await editMessage(bot, "To change your passcode. Enter your Account Unique Token", {
                    chat_id: chatId,
                    message_id: messageId,
                    reply_markup: JSON.stringify({
                        inline_keyboard: [
                            [{ text: 'Cancel', callback_data: 'mainMenu' }],
                        ],
                    }),
                });
                break;

            case 'verify':
                verifyTransaction(chatId, parsedData.value).then((receipt) => {
                    const options = stringify([ [{ text: 'Delete Transaction', callback_data: 'del' }], [{ text: 'Verify Transaction', callback_data: 'verify' }]]);
                    editMessage(bot, receipt, {
                        chat_id: chatId,
                        message_id: msgId,
                        reply_markup: options.reply_markup,
                    })
                    
                });
                break
            case 'contactUs':
                await editMessage(bot, "Report Account issue", {
                    chat_id: chatId,
                    message_id: messageId,
                    reply_markup: JSON.stringify({
                        inline_keyboard: [
                            [option(`Account issue`, JSON.stringify({
                                type: "contact",
                                value: 'accountIssue',
                            }))],
                            [{ text: 'Send us a message', callback_data: 'bug' }],
                            [option('Cancel Request', 'mainMenu')],
                        ]
                    })
                });
                break;            
            case 'depositOpt':
                await editMessage(bot, "Select option below to make deposit.", {
                    chat_id: chatId,
                    message_id: messageId,
                    reply_markup: JSON.stringify({
                        inline_keyboard: [
                            [{ text: 'Automated Transfer', callback_data: 'autoTrans' }],
                            [{ text: 'Manual Transfer', callback_data: 'manuTrans' }],
                            [option('🔙 Back', 'mainMenu')],
                        ]
                    })
                });
                break;            
            case 'autoTrans':
                await editMessage(bot, "This is an automated account and you will be charged ₦50 for each deposit. Transfer to this account to ... reflect on your balance.", {
                    chat_id: chatId,
                    message_id: messageId,
                    reply_markup: JSON.stringify({
                        inline_keyboard: [
                            [{ text: 'Report pending transfer', callback_data: JSON.stringify({
                                type: "contact",
                                value: 'autoTrans',
                            }) }],
                            [{ text: '🔙 Back', callback_data: 'depositOpt'}],
                        ]
                    })
                });
                break;            
            case 'manuTrans':
                await editMessage(bot, "This is a manual transfer. You will send us your Account Name and Amount to confirm the transfer \n Bank: Opay\nAccount Name: Philip Tahavnaadoo Aondona\nAccount No: 812470328\n and many more banks na you no know.", {
                    chat_id: chatId,
                    message_id: messageId,
                    reply_markup: JSON.stringify({
                        inline_keyboard: [
                            [{ text: 'copy Account No.', callback_data: 'copy' }],
                            [{ text: 'Send details for verification', callback_data: JSON.stringify({
                                type: "contact",
                                value: 'manualTrans',
                            }) }],
                            [option('🔙 Back', 'mainMenu')],
                        ]
                    })
                });
                break;            
            case 'bug':
                await updateUserState(chatId, { bug: true, msgId: messageId });
                await editMessage(bot, "Hi dear, you can enter the message.", {
                    chat_id: chatId,
                    message_id: state.msgId,
                    reply_markup: JSON.stringify({
                        inline_keyboard: [
                            [{ text: 'Cancel', callback_data: 'mainMenu' }],
                        ],
                    }),
                });
                break;
            
            case 'signUser':
                if (!user) {
                    const options = stringify([ [option('Login with AUT', 'login')] ]);
                    editMessage(bot, 'To continue enter a passcode of at least 4 characters.', {
                        chat_id: chatId,
                        message_id: messageId,
                        reply_markup: options.reply_markup
                    }).then(async() => {
                        await updateUserState(chatId, { p1c: true, msgId: messageId, isAUT: false });
                    });
                } else {
                    await sendMainMenu(bot, chatId, state.msgId);
                }
                break;
            
            
            case 'download':
                editMessage(bot, 'Loading receipt image.', {
                    chat_id: chatId,
                    message_id: messageId,
                }).then(async() => {
                    sendPhoto(bot, state.ref, chatId)
                });
                break;
            default:
                callback_default(bot, data, parsedData, chatId, messageId)
                break
        }
    } catch (error) {
        console.error('Error handling callback:', error);
    }
}

module.exports = handle_callback_data;