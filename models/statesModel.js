const mongoose = require("mongoose");

const stateSchema = mongoose.Schema({
    userId: {
        type: String,
        required: true,
        unique: true,
    },
    msgId: {
        type: String,
        default: null
    },
    phone: {
        type: String,
        default: null
    },
    isPhone: {
        type: Boolean,
        default: false
    },
    isAirtime: {
        type: Boolean,
        default: false
    },
    textValue: {
        type: String,
        default: null
    },
    plan_id: {
        type: String,
        default: null
    },
    network_id: {
        type: String,
        default: null
    },
    amount: {
        type: Number,
        default: null
    },
    isAUT: {
        type: Boolean,
        default: false
    },
    isAdmin: {
        type: Boolean,
        default: false
    },
    aut: {
        type: String,
        default: null
    },
    authaction: {
        type: String,
        default: null
    },
    auth: {
        type: Boolean,
        default: false
    },
    cpass: {
        type: Boolean,
        default: false
    },
    dataAmount: {
        type: String,
        default: null
    },
    bugType: {
        type: String,
        default: null
    },
    bug: {
        type: Boolean,
        default: false
    },
    reqUser: {
        type: Object,
        default: {}
    },
    a: {
        type: Boolean,
        default: false
    },
    ref: {
        type: Object,
        default: {}
    },
    p1c: {
        type: Boolean,
        default: false
    },
    retry: {
        type: Boolean,
        default: false
    },
    signin: {
        type: Boolean,
        default: false
    },
    login: {
        type: Boolean,
        default: false
    },
    text: {
        type: Boolean,
        default: false
    },
    contact: {
        type: Object,
        required: true
    },
}, {
    timestamps: true
});

const State = mongoose.model("State", stateSchema)

module.exports = State;