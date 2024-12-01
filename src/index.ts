import puppeteer from "puppeteer"


(async () => {
  // Launch a new browser instance
  const browser = await puppeteer.launch({
    headless: false, // Set to false to see the browser
    defaultViewport: null, // Use default viewport
  });

  // Open a new page
  const page = await browser.newPage();

  // Navigate to the given URL
  const url = 'https://al-zahraa.mans.edu.eg/studentLogin';
  try {
    console.log(`Navigating to ${url}...`);
    await page.goto(url, { waitUntil: 'networkidle2' });

    console.log('Navigation successful.');
    // You can now perform actions like input text or click buttons
    // Example: Wait for a specific selector to load
    // await page.waitForSelector('input[name="username"]'); // Example selector
  } catch (error) {
    console.error('Error navigating to the page:', error);
  }

  // Optionally close the browser
  // await browser.close();
})();
