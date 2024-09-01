const forms = require("../api/Data_Plans");
const { generateRandomString } = require("../middleware/userMiddleware");

const menu = (admin) => {
    return { text: 'Admin Menu', callback_data: JSON.stringify({
    action: "menu",
    type: 'admin',
    user: admin,
}) }};

function stringify(para) {
    return {
        reply_markup: JSON.stringify({
            inline_keyboard: para,
        }),
    }
}

function callback(name, user, action) {
    return { text: `${name}`, callback_data: JSON.stringify({
        action: `${action}`,
        type: 'admin',
        user: user,
    })}
}

function option(name, action) {
    return { text: `${name}`, callback_data: `${action}` }
};

function dateformat(date, time = 0) {
    return date.toISOString().split('T')[time];
};

const _message = `Hello👋🏾, Am M-bot specially designed to make your airtime and data purchase as easy and fast as possible.
        
Let's proceed. What would you like to do:
        
1. Register. _Enjoy fast and seamless transactions_
                
2. Login. _Switch your existing account to this number_
        
3. Make anonymous purchase
        
4. About M-bot
        
5. Privacy policy
        
6. Report issue
        
Select option by entering the Options Number.
            `;

function extractDataAmount(innerText) {
    const regex1 = /(\d+[.]+\d+GB|\d+[.]+\d+MB)/;
    const regex2 = /(\d+GB|\d+MB)/;
    const match = innerText.match(regex1) || innerText.match(regex2);
    return match ? match[0] : null;
}
  
function extractNairaAmount(innerText) {
    const regex = /₦([\d,]+)/;
    const match = innerText.match(regex);
    return match ? match[1].replace(/,/g, '') : null;
}

const key = [
    'me',
    'MTN',
    'Glo',
    '9mobile',
    'Airtel',
];

function findServicePlanText(value, network_id) {
    if (network_id==='1') {
        const f = forms.mtn;
        for (const form in f) {
            if (form === 'Value') {
                continue;
            }
            const plans = f[form].Data_Plan;
            for (const plan of plans) {
                if (plan.Value === value.toString()) {
                return plan.InnerText;
                }
            }
        }
        return null
  } else {
    for (const form in forms) {
        const plans = forms[form].Data_Plan;
        for (const plan of plans) {
            if (plan.Value === value.toString()) {
            return plan.InnerText;
            }
        }
    }
    return null;
  }
}

const generateAut = () => {
  const prefix = '$' + Date.now().toString() + "@";
  const characters = 'MTSEGHNADOO';
  let referenceId = prefix + generateRandomString(10, characters); // 2 characters after '@'...
  
  return referenceId;
};

const mtn_plans = [
    'MTN_CG1',
    'MTN_CG2',
    'MTN_GIFTING',
    'MTN_SME',
]

function getValidity(innerText) {
    const data = extractDataAmount(innerText);
    const regex = /(\d+day[s]{0,1}|\d+[' ']+day[s]{0,1})/;
    const match = innerText.match(regex);
    const validity = match ? match[0] : null;
    return `${data} for ${validity}`;
}


module.exports = {
  _message,
  extractDataAmount,
  extractNairaAmount,
  findServicePlanText,
  generateAut,
  key,
  menu,
  callback,
  option,
  mtn_plans,
  stringify,
  dateformat,
  getValidity
}



