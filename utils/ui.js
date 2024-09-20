const { getTransactionHistory } = require("../controllers/transactionController");

const _Initial_Message = (message) => {

    switch (message) {
        case "_message":
            
            const _message = `
                Hello👋🏾, Am M-bot specially designed to make your airtime and data purchase as easy and fast as possible.
        
                Let's proceed. What would you like to do:
        
                1. Register. _Enjoy fast and seamless transactions_
                
                2. Login. _Switch your existing account to this number_
        
                3. Make anonymous purchase
        
                4. About M-bot
        
                5. Privacy policy
        
                6. Report issue
        
                Select option by entering the Options Number.
            `;
            return _message;
        
        case "_1":
            const _1 = `
                Enter *username* to create account:
            `;        
            return _1;
        
        case "_2":
            const _2 = `
                Enter your *Account Unique Token* to continue:
            `;
            return _2;
        
        case "_3":
            const _3 = `
                coming soon
            `;
            return _3;
        
        case "_4":
            const _4 = `
                About
            `;
            return _4;
        
        case "_5":
            const _5 = `
                Privacy
            `;
            return _5;
        
        case "_6":
            const _6 = `
                Please describe in detail the problem:
        
                _Please begin the message with the word *Bug*. For example: _"Bug. Problem is..."_
            `;
            return _6;
        
        default:
            const error = `
                Please enter a valid option number
            `;
            return error;
    }
    
}

const _Loggedin_Message = async(user, message) => {
    switch(message) {
        case "_message":
            
            const _message = `
                Hello👋🏾, ${user.username}.

                Ohh no! Your transaction session expired. Enter _START_ to start new transaction session.
        
                Or enter option number to select action.

                1. Check balance.
                
                2. Get account history.
        
                3. Resolve pending transactions.
        
                4. Request new Account Unique Token(AUT)
        
                5. View pricing
        
                6. Report issue
        
                Select option by entering the Options Number enter _START_ to start transaction session.
            `;
            return _message;
        
        case "_START":
            const expires = new Date(Date.now() + 30 * 60 * 1000);
            user.inactive = expires;
            await user.save()
            const _Service = `
                Enter option number to select Service.

                1. Buy Airtime.
                
                2. Buy Data.
        
                3. Make Deposit.
        
                4. Server status.
            `
            return _Service;
        
        case "_1":
                    
            return user.balance;
        
        case "_2":
            const _2 = await getTransactionHistory(user._id);
            return _2;
        
        case "_3":
            const _3 = `
                Resolve pending transactions.
            `;
            return _3;
        
        case "_4":
            const _4 = `
                Request new Account Unique Token(AUT)
            `;
            return _4;
        
        case "_5":
            const _5 = `
                View pricing
            `;
            return _5;
        
        case "_6":
            const _6 = `
                Please describe in detail the problem:
        
                _Please begin the message with the word *Bug*. For example: _"Bug. Problem is..."_
            `;
            return _6;
        
        default:
            const error = `
                Please enter a valid option number
            `;
            return error;
    }
}

const _Active_Session_Message = async(user, message) => {
    switch(message) {
        case "_Purchase":
            
            const network = `
                Enter option number to select Network.

                1. MTN.
                
                2. AIRTEL.

                3. GLO.

                4. 9MOBILE
            `;
            return network;
                
        case "_Deposit":
            
            const _Deposit = `
                Deposit to this account to fund your wallet.
                Note: This is automatic and 50 will be charged.
                $

                Or To deposit manually message me +2347085972070. 
            `
            return _Deposit;
        
        case "_Airtime_Amount":
            
            const _MTN = `
                Enter Airtime Amount.
                _enter only digits_
            `;
            return network;
        
        case "_Receivers_Phone_number":
            
            const _Phone_number = `
                Enter Receivers Phone number: 
            `
            return _Phone_number;
        
        
        case "_Error_phone":
            const _Error = `
                Please enter a valid option number
            `;
            return _Error;
    
        default:
            const error = `
                Please enter a valid option number
            `;
            return error;
    }
}

const _Purchase_Session_Message = (message) => {
    switch(message) {
        case "_serve":
            for (const InnerText in forms._Airtel_CG._Service_Plan) {
                const element = forms._Airtel_CG._Service_Plan[InnerText].InnerText;
                return element;
            }

            // const _MTN = `
            //     Enter Airtime Amount.
            //     _enter only digits_
            // `;
            
        
        case "_Receivers_Phone_number":
            
            const _Phone_number = `
                Enter Receivers Phone number: 
            `
            return _Phone_number;
        
        
        case "_Error_phone":
            const _Error = `
                Please enter a valid option number
            `;
            return _Error;
    }
}

const forms = {
    _Airtel_CG: {
      _Service_Type: {
        Value: "02",
        InnerText: "CG"
      },
      _Service_Plan: [
        {
          Value: "104",
          InnerText: "100MB ₦64 for 7days"
        },
        {
          Value: "105",
          InnerText: "300MB ₦124 for 7days"
        },
        {
          Value: "106",
          InnerText: "500MB ₦147 for 30days"
        },
        {
          Value: "107",
          InnerText: "1GB ₦280 for 30days"
        },
        {
          Value: "108",
          InnerText: "2GB ₦561 for 30days"
        },
        {
          Value: "109",
          InnerText: "5GB ₦1,402 for 30days"
        },
        {
          Value: "124",
          InnerText: "10GB ₦2,803 for 30days"
        },
        {
          Value: "139",
          InnerText: "15GB ₦4,205 for 30days"
        },
        {
          Value: "140",
          InnerText: "20GB ₦5,606 for 30days"
        }
      ]
    },
    _Second_Form: {
      _Service_Type: {
        Value: "02",
        InnerText: "CG"
      },
      _Service_Plan: [
        {
          Value: "158",
          InnerText: "200MB ₦76 for 14days"
        },
        {
          Value: "159",
          InnerText: "500MB ₦139 for 30days"
        },
        {
          Value: "160",
          InnerText: "1GB ₦277 for 30days"
        },
        {
          Value: "161",
          InnerText: "2GB ₦554 for 30days"
        },
        {
          Value: "162",
          InnerText: "3GB ₦830 for 30days"
        },
        {
          Value: "163",
          InnerText: "5GB ₦1,384 for 30days"
        },
        {
          Value: "164",
          InnerText: "10GB ₦2,768 for 30days"
        }
      ]
    },
    _Third_Form: {
      _Service_Type: {
        Value: "01",
        InnerText: "SME"
      },
      _Service_Plan: [
        {
          Value: "166",
          InnerText: "100MB ₦18 for 30days"
        },
        {
          Value: "167",
          InnerText: "300MB ₦49 for 30days"
        },
        {
          Value: "168",
          InnerText: "500MB ₦69 for 30days"
        },
        {
          Value: "128",
          InnerText: "1GB ₦137 for 30days"
        },
        {
          Value: "130",
          InnerText: "2GB ₦275 for 30days"
        },
        {
          Value: "132",
          InnerText: "3GB ₦412 for 30days"
        },
        {
          Value: "134",
          InnerText: "5GB ₦687 for 30days"
        },
        {
          Value: "171",
          InnerText: "11GB ₦1,512 for 30days"
        },
        {
          Value: "137",
          Price: 78,
          InnerText: "15GB ₦2,061 for 30days"
        }
      ]
    }
  }
console.log(_Purchase_Session_Message("_serve"))