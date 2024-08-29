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
                totalBalance: users[i].balance 
            });
        }  
        console.log(userInfo);
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
        const { AUT, balance, transactionHistory, details, telegramId  } = user;

        return { AUT, balance, details, telegramId  };
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
            balance: user.balance,
            details: user.details,
            telegramId: user.telegramId,
        }));

        return userInfos;  // Return an array of user info objects
    } catch (error) {
        return { error: error.message };
    }
});

const changeUserStatus = asyncHandler(async (TId, status) => {
    try {
        
        const user = await User.findOne({ telegramId: TId });
    
        if (user) {
            const { accountStatus } = user;
            user.accountStatus = status || accountStatus;
    
            const updatedUserStatus = await user.save();
    
            return updatedUserStatus.accountStatus;
        } else {
            return { message: "User not found" };
        }
    } catch (error) {
        return { error: error.message }
    }
    
});

const setAdmin = asyncHandler(async (TId, status) => {
    try {
        
        const user = await User.findOne({ telegramId: TId });
    
        if (user) {
            user.admin = status;
    
            const madeAdmin = await user.save();
    
            return { success: `${madeAdmin.name} has been removed as admin` };
        } else {
            return { message: "User not found" };
        }
    } catch (error) {
        return { error: error.message }
    }
    
});

module.exports = {
    getAllUsers,
    getUserInfo,
    changeUserStatus,
    search,
    setAdmin
}