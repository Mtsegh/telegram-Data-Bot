const { key, extractNairaAmount, extractDataAmount, callback, menu, option, stringify } = require("./botfunction");
const { registerUser, changepasscode, accountswitch } = require("../controllers/userController");
const User = require("../models/userModel");
const { getUserStateFromDB, updateUserState, resetUserState } = require("../states");
const { secured, Adminauth } = require("./auth");
const { deleteMessage, sendMessage, editMessage } = require("./sender");
const errorHandler = require("../middleware/errorMiddleware");
const { saveMessageData } = require("../middleware/authMiddleware");
const { Contactadmin } = require("./admin");

const handle_message = async (bot, msge) => {
    const chatId = msge.chat.id;
    const message = msge.text;
    const Name = msge.chat.first_name
    console.log(Name);
    const state = await getUserStateFromDB(chatId);
    const user = await User.findOne({telegramId:chatId});
    await saveMessageData(msge)   
    const aut_regex = /^\$\d{13}@[MTSEGHNADOO]{10}$/
    
    try {
        if (/\/start/.test(message)) {
            if (!state) {
                return "An error occured;"
            }
            if (!user) {
                const options = { reply_markup: { inline_keyboard: [ [option('Login with AUT', 'login')] ] } };
                sendMessage(bot, chatId, 'To continue enter a passcode of at least 4 characters.', options).then(async() => {
                    await updateUserState(chatId, { p1c: true, retry: false, notuser: true });
                });
            } else {
                if (!user.admin) await sendMainMenu(bot, chatId, state.msgId);
                if (user.admin) {
                    const options = stringify([
                        [menu(chatId)],
                        ])
                        
                    await sendMessage(bot, chatId, "Admin, select option below", options);
                    
                }
                await updateUserState(chatId, { retry: false })
            }
        
        } else if (state.isAUT && aut_regex.test(message)) {
            
            try {
                const isuser = await User.findOne({ AUT: message });
                
                if (isuser) {
                    await deleteMessage(bot, chatId, msge.message_id)
                    if (state.cpass) {
                        editMessage(bot, 'Enter New Passcode of at least 4 characters.', {
                            chat_id: chatId,
                            message_id: state.msgId,
                            reply_markup: JSON.stringify({
                                inline_keyboard: [
                                    [{ text: 'Cancel', callback_data: 'mainMenu' }],
                                ],
                            }),
                        }).then(async() => {
                            await updateUserState(chatId, { isAUT: false, aut: message, retry: false });
                        });
                    } else if (state.login) {
                        await deleteMessage(bot, chatId, state.msgId);
                        sendMessage(bot, chatId, 'Logging in...').then(async(msg) => {
                            
                            accountswitch(chatId, message).then(async(login) => {
                                
                                if (login.message||login.error) {
                                    await errorHandler(bot, chatId, msg, `${login.message||login.error}\nPlease contact us with the button below if the issue persists.`, {reply_markup: JSON.stringify({
                                        inline_keyboard: [
                                            [option('Try again', 'login')],
                                            [option('Contact Admin', JSON.stringify({
                                                type: "contact",
                                                value: 'accountIssue',
                                            }))],
                                        ],
                                    })})
                                    return;
                                }
                                await editMessage(bot, login.success, {
                                    chat_id: chatId,
                                    message_id: msg,
                                    reply_markup: JSON.stringify({
                                        inline_keyboard: [
                                            [{ text: '🔙 Back', callback_data: 'mainMenu' }],
                                        ],
                                    }),
                                })
                                await updateUserState(chatId, { retry: false })
                            });
                        });
                    }
                } else {
                    if (state.retry === true) {
                        return;
                    }
                    await updateUserState(chatId, { retry: true })
                    await editMessage(bot, "Invalid token. Please re-enter your token or contact support.", {
                        chat_id: chatId,
                        message_id: state.msgId,
                        reply_markup: JSON.stringify({
                            inline_keyboard: [
                                [{ text: 'Support', callback_data: JSON.stringify({
                                    type: "contact",
                                    value: 'support',
                                }) }],
                                [{ text: 'Cancel', callback_data: user?'mainMenu':'login' }],
                            ],
                        }),
                    })
                }
            } catch (error) {
                console.error('Error finding user:', error);
            }
        } else if (state.cpass && !state.isAUT) {
            if (message.length >= 4) {
                await deleteMessage(bot, chatId, state.msgId);
                await sendMessage(bot, chatId, 'Updating Passcode...').then((msg) => {
                    changepasscode(state.aut, message).then(async(npc) => {
                        await deleteMessage(bot, chatId, msge.message_id);
                        if (npc.message||npc.error) {
                            await errorHandler(bot, chatId, msg, `${npc.message||npc.error}\nPlease contact us with the button below if the issue persists.`, {reply_markup: JSON.stringify({
                                inline_keyboard: [
                                    [option('Contact Admin', JSON.stringify({
                                        type: "contact",
                                        value: 'accountIssue',
                                    }))],
                                ],
                            })})
                            return;
                        }
                        await editMessage(bot, npc.success, {
                            chat_id: chatId,
                            message_id: msg,
                            reply_markup: JSON.stringify({
                                inline_keyboard: [
                                    [{ text: '🔙 Back', callback_data: 'mainMenu' }],
                                ],
                            }),
                        })
                        await updateUserState(chatId, { retry: false })
                    });
                })
            } else {
                if (state.retry === true) {
                    return;
                }
                await updateUserState(chatId, { retry: true });
                await editMessage(bot, 'Passcode must be at least 4 characters long. Please try again or click cancel to cancel.', {
                    chat_id: chatId,
                    message_id: state.msgId,
                    reply_markup: JSON.stringify({
                        inline_keyboard: [
                            [{ text: 'Cancel', callback_data: 'mainMenu' }],
                        ],
                    }),
                });
            }
        
        } else if (state.isPhone) {
            if (/^0[789]\d{9}$/.test(message) && state.isAirtime) {
                await updateUserState(chatId, { phone: message });
                const options = { reply_markup: { inline_keyboard: [ [{ text: '₦50', callback_data: '50' }], [{ text: '₦100', callback_data: '100' }], [{ text: '₦150', callback_data: '150' }], [{ text: '₦200', callback_data: '200' }], [{ text: '₦250', callback_data: '250' }], [{ text: '₦300', callback_data: '300' }], [{ text: '₦350', callback_data: '350' }], [{ text: '₦400', callback_data: '400' }], [{ text: '₦450', callback_data: '450' }], [{ text: '₦500', callback_data: '500' }], [{ text: '🔙 Back', callback_data: 'airtimeOpt' }] ] } };
                console.log(state.msgId);
                await deleteMessage(bot, chatId, state.msgId);
                await sendMessage(bot, chatId, `Select Airtime amount:`, options);
                await updateUserState(chatId, { retry: false })
            } else if (/^0[789]\d{9}$/.test(message)) {
                
                await updateUserState(chatId, { amount: extractNairaAmount(state.textValue), phone: message, auth: true, authaction: "buydata", retry: false, isPhone: false });
                const options = {
                    reply_markup: JSON.stringify({
                        inline_keyboard: [
                        [{ text: '🔙 Back', callback_data: 'dataOpt' }],
                        [{ text: 'Cancel Request', callback_data: 'option1' }],
                        ]
                    })
                };
                const nstate = await getUserStateFromDB(chatId);
                await deleteMessage(bot, chatId, state.msgId);
                await sendMessage(bot, chatId, `Confirm your request for ${extractDataAmount(nstate.textValue)} to ${nstate.phone}:\nEnter your passcode to Pay ₦${extractNairaAmount(state.textValue)}`, options).then(async()=>{
                    await updateUserState(chatId, { retry: false })
                });
            } else {
                if (state.retry === true) {
                    return;
                }
                await updateUserState(chatId, { retry: true })
                await editMessage(bot, 'Invalid phone number. Please re-enter a valid phone number.\nExample: 09123456789', {
                    chat_id: chatId,
                    message_id: state.msgId,
                    reply_markup: JSON.stringify({
                        inline_keyboard: [
                            [{ text: 'Cancel', callback_data: 'mainMenu' }],
                        ],
                    }),
                });
            }
        } else if (state.p1c) {
            const passcode = message
            await editMessage(bot, 'Passcode Received. Registration in progress...', {
                chat_id: chatId,
                message_id: state.msgId,
            }).then(async() => {
                registerUser(Name, passcode, chatId).then(async(register) => {
                    await deleteMessage(bot, chatId, msge.message_id);
                    if (register.message||register.error) {
                        await errorHandler(bot, chatId, state.msgId, `${register.message||register.error}\n\nPlease click on /start or type */start* to try again.\nYou can contact us with the button below.`, {reply_markup: JSON.stringify({
                            inline_keyboard: [
                                [option('Contact Admin', JSON.stringify({
                                    type: "contact",
                                    value: 'accountIssue',
                                }))],
                            ],
                        })})
                        return;
                    }
                    await deleteMessage(bot, chatId, state.msgId);
                    await sendStartMessage(bot, chatId, register);
                    await resetUserState(chatId);
                })
            }); 
            
        } else if (state.text && user.admin) {
            await editMessage(bot, 'Enter passcode to process your request', {
                chat_id: chatId,
                message_id: state.msgId,
            })
            await updateUserState(chatId, { auth: true, amount: message });
            
        } else if (state.auth) {
            if (message !== user.passcode) {
                if (state.isadmin) {
                    await sendMessage(bot, chatId, 'Passcode not correct. Please try again.\nEnter passcode:', {
                        reply_markup: JSON.stringify({
                            inline_keyboard: [
                                [callback('🔙 Back', state.bugAccountId, 'getUser')]
                                [menu(admin)],
                            ],
                        }),
                    });
                } else {              
                    await editMessage(bot, "Passcode not correct. Please try again.\nEnter passcode:", {
                        chat_id: chatId,
                        message_id: state.msgId,
                        reply_markup: JSON.stringify({
                            inline_keyboard: [
                                [option('Forgot Password', 'changepass')],
                                [option('Cancel Request', 'airtimeOpt')],
                            ]
                        })
                            
                    })
                }
                return;
            }
            await deleteMessage(bot, chatId, msge.message_id)
            if (state.isadmin) {
                Adminauth(bot, chatId, state.bugAccountId, state.action);
            } else { 
                await secured(bot, state.authaction, chatId, state.msgId)
            }
        } else if (state.bug) {
            const bug = `${state.bugType}\n${message}\n\nUserId: ${chatId}`;
            await deleteMessage(bot, chatId, state.msgId)
            await sendMessage(bot, chatId, 'We have received your message. Our team will fix it as soon as possible. We regret any inconvenience this might have caused you.', {
                reply_markup: JSON.stringify({
                    inline_keyboard: [
                        [{ text: '🔙 Back', callback_data: 'mainMenu'}],
                    ]
                })
            }).then(async() => {
                await updateUserState(chatId, { bugAccountId: chatId })
                await Contactadmin.send(bot, bug, chatId)
            });
            
        } else {
            console.log(state)
            if (state.retry === true) {
                return;
            }
            await updateUserState(chatId, { retry: true })
            await deleteMessage(bot, chatId, state.msgId);
            await sendMessage(bot, chatId, 'Unknown command. Please use the available options. Or type */start* to begin if no valid options', {
                reply_markup: JSON.stringify({
                    inline_keyboard: [
                        [{ text: 'Cancel', callback_data: 'mainMenu' }],
                    ],
                }),
            });
        }
    } catch (error) {
        console.error(error);
        
        await errorHandler(bot, chatId, state.msgId, `Network failed. Try again.\nIf issue persists contact admin`, stringify([[option('Contact', JSON.stringify({ type: 'contact', value: 'accountIssue' }))], [option('🔙 Back', 'mainMenu')]]));
    }
}

async function sendStartMessage(bot, chatId, register) {
    try {
        if (!register.AUT) {
            await sendMessage(bot, chatId, "User not found")
            return
        }
        const options = {
            reply_markup: JSON.stringify({
                inline_keyboard: [
                    [{ text: 'Make Purchase', callback_data: 'option1' }],
                    [{ text: 'Manage Account', callback_data: 'option2' }],
                ],
            }),
        };
        await sendMessage(bot, chatId, `Hello Dear. We are happy to have you on our Vendor Bot. Here is your Account Unique Token \n${register.AUT}. \nYou will need this in case you want to access your VB account on another telegram account, so keep it safe dear, this token contains all your  account info and transactions. Select an option below to proceed:`, options)
            .then(async() => {
                await updateUserState(chatId, { p1c: false, retry: false });
            });
    } catch (error) {
        await errorHandler(bot, chatId, state.msgId, `Network failed. Try again.\nIf issue persists contact admin`, stringify([[option('Contact', JSON.stringify({ type: 'contact', value: 'accountIssue' }))], [option('🔙 Back', 'mainMenu')]]));
    }
}

async function sendMainMenu(bot, chatId, msgId) {
    const options = {
        reply_markup: JSON.stringify({
            inline_keyboard: [
                [{ text: 'Make Purchase', callback_data: 'option1' }],
                [{ text: 'Manage Account', callback_data: 'option2' }],
            ],
        }),
    };

    try {
        if (!msgId) {
            // Send a new message
            await sendMessage(bot, chatId, 'Choose an option:', options);
        } else {
            await deleteMessage(bot, chatId, msgId);
            await sendMessage(bot, chatId, 'Choose an option:', options);
        }
    } catch (error) {
        console.error('Failed to send or edit message:', error.message);
    }
}

async function sendDataFormsMenu(bot, chatId, messageId) {
    const dataForms = {
        reply_markup: JSON.stringify({
            inline_keyboard: [
                [{ text: 'MTN', callback_data: 'mtn' }],
                [{ text: 'Airtel CG', callback_data: 'airtel' }],
                [{ text: '9mobile', callback_data: '9mobile' }],
                [{ text: 'Glo', callback_data: 'glo' }],
                [{ text: '🔙 Back', callback_data: 'mainMenu' }],
            ],
        }),
    };
    await editMessage(bot, 'Choose a data form:', {
        chat_id: chatId,
        message_id: messageId,
        reply_markup: dataForms.reply_markup,
    });
}

module.exports = {
    handle_message,
    sendMainMenu,
    sendDataFormsMenu,
    sendStartMessage
}