
const mongoose = require("mongoose");

const { encryptPassword } = require("../middleware/userMiddleware");

const transactionHistorySchema = mongoose.Schema({
    referenceId: {
        type: String,
        required: true,
    },
    API_Id: {
        type: String
    },
    amount: {
        type: Number,
        required: true
    },
    type: {
        type: String,
        enum: ['Deposit', 'Data purchase', 'Airtime purchase'],
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
        enum: ['failed', 'pending', 'completed'],
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
        type: String,
        enum: ['verified', 'suspended', 'blocked'],
        default: 'verified'
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

