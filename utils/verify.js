const puppeteer = require("puppeteer");


const verify = async (referenceId) => {
    try {
        // Launch the browser
        const browser = await puppeteer.launch({ headless: false }); // Change to true for production
        const page = await browser.newPage();

        // Navigate to the transaction receipt page
        await page.goto(`https://agbabills.com/transaction/${referenceId}`, { waitUntil: 'networkidle2'});
        console.log(process.env.AGBABILLS_EMAIL)
        await page.waitForSelector('#email')
        // Perform login
        await page.type('#email', 'phinehasaondona007@gmail.com', { delay: 10 })
        await page.type('#password', 'elsa@2007', { delay: 5 })
        
        // Click on login button and wait for navigation
        await page.click('button[type="submit"]'), 

        await page.waitForNavigation({ waitUntil: 'networkidle2'});
        
        const transactionDetails = await page.evaluate(() => {
            // Function to extract text content from an element or return null if not found
            const extractText = (selector) => {
                const element = document.querySelector(selector);
                return element ? element.textContent.trim() : null;
            };

            // Extract individual fields
            const id = extractText('.text-sm.text-gray-500');
            const date = extractText('.block.text-sm.font-medium.text-gray-800');
            const bundle = extractText('li:nth-child(3) span:last-child');
            const amount = extractText('.flex.flex-col li:nth-child(10) div'); // Adjusted selector to get amount correctly
            const status = extractText('.bg-green-100.rounded-md.px-2.py-1.text-xs.leading-tight.font-medium.text-green-500');
            const mobileNo = extractText('li:nth-child(2) span:last-child');

            // Return an object with all extracted details
            return { id, date, bundle, amount, status, mobileNo };
        });
        // Log or use the extracted data
        console.log('Transaction Details:');
        console.log(transactionDetails);

        await browser.close();
        return transactionDetails;
    } catch (error) {
        console.error('Error scraping transaction:', error);
        return null;
    }
};

module.exports = verify
// Usage example