
const puppeteer = require('puppeteer');
const path = require('path');
async function captureDivScreenshot(TId, info) {
    // Define your HTML content with styles
    const htmlContent = `
      <html>
    <head>
          <style>
            body {
                
                font-family: Arial, sans-serif;
                background-color: #f5f5f5;
                margin: 0;
                padding: 20px;
                color: #333;
            }
            .container {
              display: flex;
              flex-direction: column;
              justify-content: center;
              max-width: 325px;
              margin: 0 auto;
              background-color: #fff;
              padding: 20px;
              border-radius: 1px;
              box-shadow: 0 0 10px rgba(0, 0, 0);
              
            }
            h3 {
                text-align: center;
              color: #4CAF50;
            }
            h2 {
                text-align: center;
                color: orange;
                padding: 5px 0 0 0;
                margin: 0 auto;
            }
            .detail {
                padding-left: 20px;
                display: flex;
                justify-self: center;
            }
            #label {
               width: 170px;
            }
            p {
              font-size: 16px;
            }
            
            .sect {
              max-width: 350px;
              padding: 4px;
              background-color: #ddd;
            }
          </style>
    </head>
    <body>
        <div class="sect">
            
        {refid:, type:, quantity:, network:, amount:, status:, date:,}
         <div class="container">
              <h2 id="vb">Vendor Bot</h2>
            <h3>Transaction Receipt</h3>
            <div class="detail"><p id="label">
                Reference Id:</p> <p>~</p><p class="value" style="color: green">${info.refid}</p></div>
            <div class="detail"><p id="label">${info.type}:</p> <p class="value">${info.quantity}</p></div>
            
            <div class="detail"><p id="label">Network Provider:</p> <p class="value">${info.network}</p></div>
            
            <div class="detail"><p id="label">Amount Paid:</p> <p class="value">₦${info.amount}</p></div>
            <div class="detail"><p id="label">Status:</p> <p class="value">${info.status}</p></div>
            <div class="detail"><p id="label">Date:</p> <p class="value">${info.date}</p></div>
            <div><p style="text-align: center;">Thank you for your purchase!<br /><a href="https://t.me/Mtsegh_bot.com">https://t.me/Mtsegh_bot.com</a></p></div>
         </div>
         </div>
    </body>
</html>
    `;

    // Launch a headless browser
    const browser = await puppeteer.launch({headless:false});
    const page = await browser.newPage();

    // Set the content of the page
    await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

    // Select the element you want to capture
    const element = await page.$('.sect');

    if (element) {
        // Capture screenshot of the specific element and save directly to the current directory
        await element.screenshot({
            path: path.join(__dirname, `./UserReceipt/${TId}.jpg`), // Save as PNG in current directory
            type: 'jpeg', // Specify PNG format
            quality: 100 // Set quality (0-100), applicable to formats like JPEG
        });

        console.log('Screenshot of the div successfully created at div-screenshot.png');
    } else {
        console.error('Element not found');
    }

    // Close the browser
    await browser.close();
}
// console.log(Date(Date.now() + 1000 * 86400000));
// console.log(Date.now()+Date.now());

// // Call the function to capture screenshot of a specific div
// captureDivScreenshot();
//console.log(dateformat(date))


class Contactadmin {
  
  static async dateformat(date) {
    return date.split(' ')+' '+date.split(' ')[2,0];
  };
}
async function name() {
  const  v = /^bug_+\d/.test('bug_100')
  console.log(v);
  
}
c = {
  id: 28840352,
  network: 1,
  ident: 'Data6a0c32e7b-dcc',
  balance_before: '368.26',
  balance_after: '361.52',
  mobile_number: '07070887096',
  plan: 377,
  Status: 'successful',
  client_ip: '105.116.1.19',
  api_response: 'Dear Customer, You have successfully shared 20MB Data to 2347070887096. Your new  data balance is 44653.85GB expires 20/10/2024. Thank you.',
  plan_network: 'MTN',
  plan_name: '20.0MB',
  plan_amount: '6.74',
  create_date: '2024-09-14T00:50:27.820025',
  Ported_number: true,
  payment_medium: 'MAIN WALLET',
  sponsor_balance: '20455.03'
} 

//console.log(mount(date))
name()