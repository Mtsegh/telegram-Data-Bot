const State = require('./models/statesModel');

// Function to update user state
async function updateUserState(chatId, updates) {
    try {

        const updatedState = await State.findOneAndUpdate(
            { userId: chatId },
            updates,
            { 
                upsert: true,
                new: true // Return the updated document
            }
        );

        if (!updatedState) {
            console.log('State not found for user:', chatId);
        } else {
            console.log('State upserted successfully for user:', chatId);
            return updatedState;
        }
    } catch (error) {
        console.error('Error updating user state:', error);
    }
}

// Function to get user state from DB and reset specific fields
async function getUserStateFromDB(chatId) {
    try {
        const state = await State.findOne({ userId: chatId });
        if (!state) {
            const updatedState = await State.create({
                userId: chatId,
                msgId: null,
                phone: null,
                isPhone: false,
                isAirtime: false,
                textValue: null,
                plan_id: null,
                network_id: null,
                amount: null,
                isAUT: false,
                aut: null,
                auth: false,
                authaction: null,
                cpass: false,
                dataAmount: null,
                bug: false,
                bugType: null,
                retry: false,
                notuser: false,
                p1c: false,
                ref: false,
                bugAccountId: null,
                text: false,
                signin: false
            });
    
            if (!updatedState) {
                console.log('Failed to create state in DB:', chatId);
            } else {
                console.log('State created successfully for user:', chatId);
                return updatedState;
            }
        }
        return state;
    } catch (error) {
        console.error('Error getting or creating user state:', error);
    }
}

// Function to reset user state
async function resetUserState(chatId) {
    try {

        const updatedState = await State.findOneAndUpdate(
            { userId: chatId },
            {
                $set: {
                    phone: null,
                    isPhone: false,
                    isAirtime: false,
                    textValue: null,
                    plan_id: null,
                    network_id: null,
                    amount: null,
                    isAUT: false,
                    aut: null,
                    auth: false,
                    authaction: null,
                    cpass: false,
                    dataAmount: null,
                    bug: false,
                    bugType: null,
                    retry: false,
                    notuser: false,
                    p1c: false,
                    ref: false,
                    bugAccountId: null,
                    text: false,
                    signin: false,
                }
            },
            { 
                new: true,
                upsert: true // Return the updated document
            }
        );

        if (!updatedState) {
            console.log('State not found for user:', chatId);
        } else {
            console.log('State reset successfully for user:', chatId);
        }
    } catch (error) {
        console.error('Error resetting user state:', error);
    }
}

module.exports = {
    resetUserState,
    getUserStateFromDB,
    updateUserState
};
