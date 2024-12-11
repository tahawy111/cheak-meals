import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import schedule from "node-schedule";
import * as dotenv from "dotenv";
import express, { Request, Response } from 'express';

const app = express();

// Health check endpoint
app.get('/check', async (req: Request, res: Response) => {
  try {
    await executeWithRetry(check, MAX_RETRIES);
    res.status(200).send('OK');
  } catch (error) {
    res.status(400).send('Error while checking meals.');
  }
});


dotenv.config();
puppeteer.use(StealthPlugin());

const MAX_RETRIES = 3; // Maximum number of retries

// Schedule the job
// schedule.scheduleJob("0 */8 * * *", () => {
//   executeWithRetry(check, MAX_RETRIES);
// }); // Every 1 Minute

// const job1 = schedule.scheduleJob("0 6 * * *", () => {
//   executeWithRetry(check, MAX_RETRIES);
// }); // 6:00 AM
// const job2 = schedule.scheduleJob("46 4 * * *", () => {
//   executeWithRetry(check, MAX_RETRIES);
// }); // 2:00 PM
// const job3 = schedule.scheduleJob("45 4 * * *", () => {
//   executeWithRetry(check, MAX_RETRIES);
// }); // Every 1 Minute


/**
 * Retry wrapper for the function to handle retries on failure
 * @param fn - The function to execute
 * @param retries - Maximum number of retries
 */
async function executeWithRetry(fn: () => Promise<void>, retries: number): Promise<void> {
  let attempt = 0;

  while (attempt < retries) {
    try {
      console.log(`Attempt ${attempt + 1} of ${retries}`);
      await fn();
      console.log("Function executed successfully.");
      return; // Exit if successful
    } catch (error) {
      attempt++;
      console.error(`Error on attempt ${attempt}:`, error);

      if (attempt >= retries) {
        console.error("Max retries reached. Aborting.");
        return; // Stop retrying
      } else {
        console.log("Retrying...");
      }
    }
  }
}

/**
 * Main check function to execute Puppeteer automation
 */
async function check(): Promise<void> {
  const browser = await puppeteer.launch({
    defaultViewport: null,
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--start-maximized"],
    timeout: 0,
  });

  const page = await browser.newPage();
  const url = "https://al-zahraa.mans.edu.eg/studentLogin";

  try {
    console.log(`Navigating to ${url}...`);
    await page.goto(url, { waitUntil: "networkidle2" });
    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
    );

    console.log("Navigation successful.");

    await page.type('input[name="txtStudentID"]', `${process.env.NID}`);
    await page.type('input[name="txtStudentPassword"]', `${process.env.PASS}`);

    await page.click(".account-btn");
    await page.waitForNavigation();
    await page.waitForSelector("#sidebar-menu > ul > li:nth-child(4) > a");
    await page.waitForSelector("a#getMeals");

    await page.click("#sidebar-menu > ul > li:nth-child(4) > a");
    await page.click("a#getMeals", { delay: 1000 });
    await page.click("a#getMeals");
    await page.waitForSelector("table", { timeout: 0 });

    await page.$$eval(
      "table table.fc-scrollgrid-sync-table > tbody td.fc-day-future div.fc-daygrid-day-bg label > input",
      (checkboxes) => {
        return checkboxes.map((checkbox) => {
          if (!checkbox.checked) {
            checkbox.checked = true;
          }
        });
      }
    );

    const checkedStatus = await page.$$eval(
      "table table.fc-scrollgrid-sync-table > tbody td.fc-day-future div.fc-daygrid-day-bg label > input",
      (checkboxes) => {
        return checkboxes.map((checkbox) => ({
          date: new Date().toLocaleString("en-ca"),
          checked: checkbox.checked,
        }));
      }
    );
    console.log(checkedStatus);

    await page.click(".fc-myCustomButton-button.fc-button.fc-button-primary");
  } catch (error) {
    console.error("Error during execution:", error);
    throw error; // Propagate error for retry logic
  } finally {
    await browser.close();
  }
}

const port: number = parseInt(process.env.PORT || '8000', 10);
app.listen(port, '0.0.0.0', () => {
  console.log(`Health check server listening on port ${port}`);
});
