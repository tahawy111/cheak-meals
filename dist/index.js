"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const puppeteer_extra_1 = __importDefault(require("puppeteer-extra"));
const puppeteer_extra_plugin_stealth_1 = __importDefault(require("puppeteer-extra-plugin-stealth"));
const node_schedule_1 = __importDefault(require("node-schedule"));
const dotenv = __importStar(require("dotenv"));
dotenv.config();
puppeteer_extra_1.default.use((0, puppeteer_extra_plugin_stealth_1.default)());
// // Schedule the job three times a day
// const job1 = schedule.scheduleJob("0 6 * * *", check); // 6:00 AM
// const job2 = schedule.scheduleJob("0 14 * * *", check); // 2:00 PM
// const job3 = schedule.scheduleJob("0 22 * * *", check); // 10:00 PM
const job3 = node_schedule_1.default.scheduleJob("*/1 * * * *", check); // 10:00 PM
function check() {
    return __awaiter(this, void 0, void 0, function* () {
        // Launch a new browser instance
        const browser = yield puppeteer_extra_1.default.launch({
            defaultViewport: null,
            headless: true,
            args: ["--no-sandbox", "--disable-setuid-sandbox", "--start-maximized"],
            timeout: 0,
        });
        // Open a new page
        const page = yield browser.newPage();
        // Navigate to the given URL
        const url = "https://al-zahraa.mans.edu.eg/studentLogin";
        try {
            console.log(`Navigating to ${url}...`);
            yield page.goto(url, { waitUntil: "networkidle2" });
            yield page.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36");
            console.log("Navigation successful.");
            yield page.type('input[name="txtStudentID"]', "30601310201497");
            yield page.type('input[name="txtStudentPassword"]', `${process.env.PASS}`);
            yield page.click(".account-btn");
            yield page.waitForNavigation();
            yield page.waitForSelector("#sidebar-menu > ul > li:nth-child(4) > a");
            yield page.waitForSelector("a#getMeals");
            yield page.click("#sidebar-menu > ul > li:nth-child(4) > a");
            yield page.click("a#getMeals", { delay: 1000 });
            yield page.click("a#getMeals");
            // await wait(2000);
            yield page.waitForSelector("table", { timeout: 0 });
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
            yield page.$$eval("table table.fc-scrollgrid-sync-table > tbody td.fc-day-future div.fc-daygrid-day-bg label > input", (checkboxes) => {
                return checkboxes.map((checkbox) => {
                    if (!checkbox.checked) {
                        checkbox.checked = true;
                    }
                });
            });
            const checkedStatus = yield page.$$eval("table table.fc-scrollgrid-sync-table > tbody td.fc-day-future div.fc-daygrid-day-bg label > input", (checkboxes) => {
                return checkboxes.map((checkbox) => ({
                    checked: checkbox.checked,
                }));
            });
            console.log(checkedStatus);
            yield page.click(".fc-myCustomButton-button.fc-button.fc-button-primary");
            yield page.screenshot({
                path: "screenshot.png", // File name
                fullPage: true, // Capture the entire page
            });
        }
        catch (error) {
            console.error("Error navigating to the page:", error);
        }
        // Optionally close the browser
        yield browser.close();
        // General-purpose wait function
        function wait(ms) {
            return new Promise((resolve) => setTimeout(resolve, ms));
        }
    });
}
