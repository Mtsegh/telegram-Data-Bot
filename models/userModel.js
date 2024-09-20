
const mongoose = require("mongoose");

const { encryptPassword } = require("../middleware/userMiddleware");

const transactionHistorySchema = mongoose.Schema({
    referenceId: {
        type: String,
        required: true,
    },
    amount: {
        type: Number,
        required: true
    },
    type: {
        type: String,
        enum: ['Deposit', 'Data Purchase', 'Airtime Purchase'],
        required: true
    },
    description: {
        type: String
    },
    provider: {
        type: String
    },
    status: {
        type: String,
        enum: ['failed', 'pending', 'completed', 'sucessfull'],
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        required: true,
        default: Date.now
    },
});

const userSchema = mongoose.Schema({
    telegramId: {
        type: Number,
        unique: true
    },
    AUT: {
        type: String,
        required: true,
        unique: true,
    },
    name: {
        type: String,
        required: true,
    },
    passcode: {
        type: String,
        required: [true, "Passcode is required"],
        minLength: [4, "Passcode must be up to 4 digits"],
        //   maxLength: [23, "Password must not be more than 23 characters"],
    },
    accountstatus: {
        type: Boolean,
        default: true
    },
    transactionHistory: [transactionHistorySchema],
    balance: {
        required: true,
        type: Number,
        default: 0.00
    },
    details: {
        type: String        
    },
    admin: {
        type: Boolean,
        default: false
    },
    token: {
        type: Number,
        default: 0
    }
    },
    {
        
        timestamps: true,
})


transactionHistorySchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

const User = mongoose.model("User", userSchema);

module.exports = User;

