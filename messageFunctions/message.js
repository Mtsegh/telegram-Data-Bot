const { key, extractNairaAmount, extractDataAmount, callback, menu, option, stringify } = require("./botfunction");
const { registerUser, changepasscode, accountswitch } = require("../controllers/userController");
const User = require("../models/userModel");
const { getUserStateFromDB, updateUserState, resetUserState } = require("../controllers/stateController");
const { secured, Adminauth, searchUser } = require("./auth");
const { deleteMessage, sendMessage, editMessage } = require("./sender");
const errorHandler = require("../middleware/errorMiddleware");
const { saveMessageData } = require("../middleware/authMiddleware");
const { Contactadmin } = require("./admin");
const { AirtimeAmounts } = require("./msgoptions");

const handle_message = async (bot, msge) => {
    const chatId = msge.chat.id;
    const message = msge.text;
    const Name = msge.chat.first_name
    console.log(Name);
    const state = await getUserStateFromDB(chatId);
    const user = state.reqUser;
    await saveMessageData(msge)   
    const aut_regex = /^\$\d{13}@[MTSEGHNADOO]{10}$/
    
    try {
        if (/\/start/.test(message)) {
            if (!state) {
                return "An error occured;"
            }
            if (!user.name) {
                const options = { reply_markup: { inline_keyboard: [ [option('Login with AUT', 'login')] ] } };
                sendMessage(bot, chatId, 'To continue enter a passcode of at least 4 characters.', options).then(async() => {
                    await updateUserState(chatId, { p1c: true, retry: false });
                });
            } else {
                if (!user.admin) await sendMainMenu(bot, chatId, state.msgId);
                if (user.admin) {
                    const options = stringify([
                        [menu(chatId)],
                    ])
                    deleteMessage(bot, chatId, state.msgId);
                    await sendMessage(bot, chatId, "Admin, select option below", options);
                    
                }
                await updateUserState(chatId, { retry: false });
            }
        
        } else if (state.isAUT && aut_regex.test(message)) {
            
            try {
                const isuser = await User.findOne({ AUT: message });
                
                if (isuser) {
                    await deleteMessage(bot, chatId, msge.message_id)
                    if (state.cpass) {
                        updateUserState(chatId, { isAUT: false, aut: message, retry: false });
                        await editMessage(bot, 'Enter New Passcode of at least 4 characters.', {
                            chat_id: chatId,
                            message_id: state.msgId,
                            reply_markup: JSON.stringify({
                                inline_keyboard: [
                                    [{ text: 'Cancel', callback_data: 'mainMenu' }],
                                ],
                            }),
                        });
                    } else if (state.login) {
                        await deleteMessage(bot, chatId, state.msgId);
                        sendMessage(bot, chatId, 'Logging in...').then(async(msg) => {
                            
                            accountswitch(chatId, message).then(async(login) => {
                                
                                if (login.message||login.error) {
                                    await errorHandler(bot, chatId, msg, `${login.message||login.error}`, { extra: 'Try again', back: 'login', contact: 'accountIssue', admin: chatId }, user.admin)
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
                                [option('Support', JSON.stringify({ type: "contact", value: 'support' }))],
                                [{ text: 'Cancel', callback_data: 'mainMenu' }],
                            ],
                        }),
                    })
                }
            } catch (error) {
                console.error('Error finding user:', error);
            }
        } else if ((state.cpass || state.p1c) && !state.isAUT) {
            if (!(message.length >= 4)) {
                if (state.retry === true) deleteMessage(bot, chatId, state.msgId)
                await updateUserState(chatId, { retry: true });
                await sendMessage(bot, chatId, 'Passcode must be at least 4 characters long. Please try again or click cancel to cancel.', stringify([[{ text: 'Cancel', callback_data: 'mainMenu' }]]));
                return;
            }
            if (state.cpass) {
                await deleteMessage(bot, chatId, state.msgId);
                await sendMessage(bot, chatId, 'Updating Passcode...').then((msg) => {
                    changepasscode(state.aut, message).then(async(npc) => {
                        await deleteMessage(bot, chatId, msge.message_id);
                        if (npc.message||npc.error) {
                            await errorHandler(bot, chatId, msg, `${npc.message||npc.error}`, { contact: 'accountIssue', back: 'changepass', admin: chatId }, user.admin);
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
            } else if (state.p1c) {
                editMessage(bot, 'Passcode Received. Registration in progress...', {
                    chat_id: chatId,
                    message_id: state.msgId,
                })
                registerUser(Name, message, chatId).then(async(register) => {
                    await deleteMessage(bot, chatId, msge.message_id);
                    if (register.message||register.error) {
                        await errorHandler(bot, chatId, state.msgId, 
                            `${register.message||register.error}\n\nPlease click on /start or type */start* to try again.\nYou can contact us with the button below.`, 
                            { contact: 'accountIssue', back: 'mainMenu' }, false)
                        return;
                    }
                    await deleteMessage(bot, chatId, state.msgId);
                    await sendStartMessage(bot, chatId, register);
                    await resetUserState(chatId);
                }); 
                
            }
        } else if (state.isPhone) {
            if (/^0[789]\d{9}$/.test(message) && state.isAirtime) {
                await updateUserState(chatId, { phone: message, retry: false });
                await deleteMessage(bot, chatId, state.msgId);
                await sendMessage(bot, chatId, `Select Airtime amount:`, AirtimeAmounts);
                await updateUserState(chatId, { })
            } else if (/^0[789]\d{9}$/.test(message)) {
                
                const nstate = await updateUserState(chatId, { amount: extractNairaAmount(state.textValue), phone: message, auth: true, authaction: "buydata", retry: false, isPhone: false, retry: false });
                const options = {
                    reply_markup: JSON.stringify({
                        inline_keyboard: [
                        [{ text: '🔙 Back', callback_data: 'dataOpt' }],
                        [{ text: 'Cancel Request', callback_data: 'option1' }],
                        ]
                    })
                };
                
                await deleteMessage(bot, chatId, state.msgId);
                await sendMessage(bot, chatId, `Confirm your request for ${extractDataAmount(nstate.textValue)} to ${nstate.phone}:\nEnter your passcode to Pay ₦${extractNairaAmount(state.textValue)}`, options);
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
        } else if (state.text && user.admin) {
            updateUserState(chatId, { auth: true, textValue: message, text: false });
            if (state.authaction === 'search') {
                await searchUser(bot, chatId)
            }
            await editMessage(bot, 'Enter passcode to process your request', {
                chat_id: chatId,
                message_id: state.msgId,
                reply_markup: JSON.stringify({
                    inline_keyboard: [
                        [callback('🔙 Back', state.contact.telegramId, 'allUser')]
                    ],
                }),
            });
            console.log('search: ', message);
            
        } else if (state.auth) {
            if (message !== user.passcode) {
                if (state.isAdmin) {
                    await sendMessage(bot, chatId, 'Passcode not correct. Please try again.\nEnter passcode:', {
                        reply_markup: JSON.stringify({
                            inline_keyboard: [
                                [callback('🔙 Back', state.contact.telegramId, 'getUser')],
                                [menu(chatId)],
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
            if (state.isAdmin) {
                Adminauth(bot, chatId, state.contact.telegramId, state.authaction);
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
                await Contactadmin.send(bot, bug, chatId)
            });
            
        } else {
            console.log(message)
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
        
        await errorHandler(bot, chatId, state.msgId, `Network failed. Try again.\nIf issue persists contact admin`, { contact: 'accountIssue', back: 'mainMenu', admin: chatId }, user.admin);
    }
}

async function sendStartMessage(bot, chatId, register) {
    try {
        if (!register.AUT) {
            await sendMessage(bot, chatId, "User not found")
            return
        }
        const options = stringify([
            [{ text: 'Make Purchase', callback_data: 'option1' }],
            [{ text: 'Manage Account', callback_data: 'option2' }],
        ]);
        
        await sendMessage(bot, chatId, `Hello! We're thrilled to have you on our Vendor Bot. Below is your unique account token:

            🔑 **Token:** ${register.AUT}
            
            Please keep this token safe, as it contains all your account information and transaction history. You will need it if you want to access your Vendor Bot account from another Telegram account.
            
            Select an option below to proceed:`, options)
            
        
            .then(async() => {
                await updateUserState(chatId, { p1c: false, retry: false });
            });
    } catch (error) {
        await errorHandler(bot, chatId, state.msgId, `Network failed. Try again.\nIf issue persists contact admin`, { contact: 'accountIssue', back: 'mainMenu', admin: chatId }, false);
    }
}

async function sendMainMenu(bot, chatId, msgId) {
    const options = stringify([
                [{ text: 'Make Purchase', callback_data: 'option1' }],
                [{ text: 'Manage Account', callback_data: 'option2' }],
            ])

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
                [{ text: 'Airtel', callback_data: 'airtel' }],
                [{ text: '9mobile', callback_data: '9mobile' }],
                [{ text: 'Glo', callback_data: 'glo' }],
                [{ text: '🔙 Back', callback_data: 'mainMenu' }],
            ],
        }),
    };
    await editMessage(bot, 'Select network:', {
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