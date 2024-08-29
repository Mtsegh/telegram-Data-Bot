const axios = require('axios');

// Function to buy airtime
const buyairtime = async (network_id, amount, phone) => {
    const data = {
        network: network_id,
        amount: amount,
        mobile_number: phone,
        Ported_number: true,
        airtime_type: 'VTU'
    };
    
    const config = {
        method: 'post',
        url: 'https://thechosendata.com/api/topup/',
        headers: { 
            'Authorization': `Token f5ebdb19ab594ca3a8c97fa7d2c69e0681ff9a95`, 
            'Content-Type': 'application/json'
        },
        data: data
    };

    try {
        const response = await axios(config);
        console.log(JSON.stringify(response.data, null, 2));
    } catch (error) {
        
        console.error('Error:', error.response ? error.response.data : error.message);
    }
}

// Function to buy data
const buydata = async (network_id, plan_id, phone) => {
    const data = {
        network: network_id,
        mobile_number: phone,
        plan: plan_id,
        Ported_number: true
    };

    const config = {
        method: 'post',
        url: 'https://thechosendata.com/api/data/',
        headers: { 
            'Authorization': `Token f5ebdb19ab594ca3a8c97fa7d2c69e0681ff9a95`, 
            'Content-Type': 'application/json'
        },
        data: data
    };

    try {
        const response = await axios(config);
        console.log(JSON.stringify(response.data, null, 2));
    } catch (error) {
        console.error('Error:', error.response ? error.response.data : error.message);
    }
}

// Function to verify transaction
const verify = async (transactionId) => {
    const config = {
        method: 'get',
        url: `https://thechosendata.com/api/data/${transactionId}`,
        headers: { 
            'Authorization': `Token f5ebdb19ab594ca3a8c97fa7d2c69e0681ff9a95`, 
            'Content-Type': 'application/json'
        }
    };

    try {
        const response = await axios(config);
        console.log(JSON.stringify(response.data, null, 2));
    } catch (error) {
        console.error('Error:', error.response ? error.response.data : error.message);
    }
}

// Function to get user info
const api_user = async () => {
    const config = {
        method: 'get',
        url: 'https://thechosendata.com/api/user/',
        headers: { 
            'Authorization': `Token ${process.env.TCD_API}`, 
            'Content-Type': 'application/json'
        }
    };

    try {
        const response = await axios(config);
        console.log(JSON.stringify(response.data, null, 2));
    } catch (error) {
        console.error('Error:', error.response ? error.response.data : error.message);
    }
}

// Function to get history
const api_airtory = async () => {
    const config = {
        method: 'get',
        url: 'https://thechosendata.com/api/data/',
        headers: {}
    };

    try {
        const response = await axios(config);
        console.log(JSON.stringify(response.data, null, 2));
    } catch (error) {
        console.error('Error:', error.response ? error.response.data : error.message);
    }
}

// Function to get specific data (api_datory)
const api_datory = async () => {
    const config = {
        method: 'get',
        url: 'https://thechosendata.com/api/data/58',
        headers: {}
    };

    try {
        const response = await axios(config);
        console.log(JSON.stringify(response.data, null, 2));
    } catch (error) {
        console.error('Error:', error.response ? error.response.data : error.message);
    }
}

module.exports = {
    buyairtime,
    buydata,
    api_airtory,
    verify,
    api_user,
    api_datory
}