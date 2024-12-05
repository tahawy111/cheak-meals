import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";

import * as dotenv from "dotenv";

dotenv.config();
puppeteer.use(StealthPlugin());

(async () => {
  // Launch a new browser instance
  const browser = await puppeteer.launch({
    defaultViewport: null,
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--start-maximized"],
    timeout: 0,
  });

  // Open a new page
  const page = await browser.newPage();

  // Navigate to the given URL
  const url = "https://al-zahraa.mans.edu.eg/studentLogin";
  try {
    console.log(`Navigating to ${url}...`);
    await page.goto(url, { waitUntil: "networkidle2" });
    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
    );

    console.log("Navigation successful.");

    await page.type('input[name="txtStudentID"]', "30601310201497");
    await page.type('input[name="txtStudentPassword"]', `${process.env.PASS}`);

    await page.click(".account-btn");

    await page.waitForNavigation();
    await page.waitForSelector("#sidebar-menu > ul > li:nth-child(4) > a");
    await page.waitForSelector("a#getMeals");

    await page.click("#sidebar-menu > ul > li:nth-child(4) > a");
    await page.click("a#getMeals", { delay: 1000 });
    await page.click("a#getMeals");
    // await wait(2000);
    await page.waitForSelector("table", { timeout: 0 });
    // await page.click("table table.fc-scrollgrid-sync-table > tbody td.fc-day-future:nth-child(1) div.fc-daygrid-day-bg label")
    // const query = await page.$("table");
    // console.log(await query?.evaluate((el) => el.innerHTML));

    // const checkedStatus = await page.$$eval(
    //   "table table.fc-scrollgrid-sync-table > tbody td.fc-day-future div.fc-daygrid-day-bg label > input",
    //   (checkboxes) => {
    //     return checkboxes.map((checkbox) => ({
    //       checked: checkbox.checked,
    //     }));
    //   }
    // );
    const checkedStatus = await page.$$eval(
      "table table.fc-scrollgrid-sync-table > tbody td.fc-day-future div.fc-daygrid-day-bg label > input",
      (checkboxes) => {
        return checkboxes.map((checkbox) => {
          if(!checkbox.checked){
            checkbox.checked = true
          }
        })
      }
    );
    
    const checkedStatus2 = await page.$$eval(
      "table table.fc-scrollgrid-sync-table > tbody td.fc-day-future div.fc-daygrid-day-bg label > input",
      (checkboxes) => {
        return checkboxes.map((checkbox) => ({
          checked: checkbox.checked,
        }));
      }
    );
    console.log(checkedStatus2);
    

    await page.click(".fc-myCustomButton-button.fc-button.fc-button-primary")

    // Print the result for each checkbox
    // checkedStatus.forEach((item) => {
    //   console.log(
    //     `Checkbox with ID ${item.id} is ${
    //       item.checked ? "checked" : "not checked"
    //     }.`
    //   );
    // });

    // const bodyHTML = await page.evaluate(() => document.body.innerHTML);
    // console.log(bodyHTML);
    await page.screenshot({
      path: "screenshot.png", // File name
      fullPage: true, // Capture the entire page
    });
  } catch (error) {
    console.error("Error navigating to the page:", error);
  }

  // Optionally close the browser
  await browser.close();
})();

// General-purpose wait function
function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
