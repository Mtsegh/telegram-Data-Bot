const asyncHandler = require("express-async-handler");
const User = require("../models/userModel");


const getAllUsers = asyncHandler(async (psd) => {
    // if (psd !== process.env.JWT_SECRET) {
    //     return 'Warning!!! Not authorized.'
    // }
    try {
        // Fetch all users sorted by createdAt descending
        const users = await User.find().sort({ createdAt: -1 });
        
        let userInfo = [];
        for (let i = 0; i < users.length; i++) {    
            userInfo.push({
                name: users[i].name,
                balance: users[i].balance,
                telegramId: users[i].telegramId
            });
        }
        return userInfo;
    } catch (error) {
        return { error: error.message };
    }
});

const getUserInfo = asyncHandler(async (psd, TId) => {
    // if (psd !== process.env.JWT_SECRET) {
    //     return 'Warning!!! Not authorized.'
    // }
    try {
        // Fetch user details
        const user = await User.findOne({ telegramId: TId });
        
        if (!user) {
            return { message: "User not found" };
        }

        // Destructure user info
        const { AUT, balance, details, telegramId, accountstatus, admin } = user;
        const text = { accountstatus: accountstatus?'Suspend user' : `Activate user`, admin: admin?'Remove admin':'Make admin' }
        return { AUT, balance, details, telegramId, text, admin };
    } catch (error) {
        return { error: error.message };
    }
});

const search = asyncHandler(async (search) => {
    try {
        // Fetch user details
        const users = await User.find(search);  // `findAll` returns an array

        if (users.length === 0) {
            return { message: "User not found" };
        }

        // Map each user to their info
        const userInfos = users.map(user => ({
            name: user.name,
            balance: user.balance,
            details: user.details,
            telegramId: user.telegramId,
        }));

        return userInfos;  // Return an array of user info objects
    } catch (error) {
        return { error: error.message };
    }
});

const changeUserStatus = asyncHandler(async (TId) => {
    try {
        if (!TId) {
            return { message: "Invalid Telegram ID" };
        }

        // Fetch the user from the database
        const user = await User.findOne({ telegramId: TId });

        if (user) {
            // Toggle the accountstatus
            user.accountstatus = !user.accountstatus;
            
            // Save the updated user and return the new status
            const updatedUser = await user.save();
            console.log(`Changing account status for user ${updatedUser.name} to ${updatedUser.accountstatus}`);
            
            return {
                success: `${updatedUser.name}'s account status has been changed to ${updatedUser.accountstatus ? 'active' : 'suspended'}`,
                text: updatedUser.accountstatus ? 'Suspend user' : 'Activate user'
            };
        } else {
            return { message: "User not found" };
        }
    } catch (error) {
        console.error('Error changing user status:', error.message);
        return { error: error.message };
    }
});

const setAdmin = asyncHandler(async (TId) => {
    try {
        if (!TId) {
            return { message: "Invalid Telegram ID" };
        }

        // Fetch the user from the database
        const user = await User.findOne({ telegramId: TId });

        if (user) {
            // Toggle the admin status
            user.admin = !user.admin;
            
            // Save the updated user and return the new admin status
            const updatedUser = await user.save();
            console.log(`Changing admin status for user ${updatedUser.name} to ${updatedUser.admin}`);
            
            return {
                success: `${updatedUser.name}'s admin status has been switched to ${updatedUser.admin ? 'admin' : 'user'}`,
                text: updatedUser.admin ? 'Remove admin' : 'Make admin'
            };
        } else {
            return { message: "User not found" };
        }
    } catch (error) {
        console.error('Error setting admin status:', error.message);
        return { error: error.message };
    }
});



module.exports = {
    getAllUsers,
    getUserInfo,
    changeUserStatus,
    search,
    setAdmin
}