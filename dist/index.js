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
// import puppeteer from "puppeteer-extra";
// import StealthPlugin from "puppeteer-extra-plugin-stealth";
// import schedule from "node-schedule";
const chrome_aws_lambda_1 = __importDefault(require("chrome-aws-lambda"));
const dotenv = __importStar(require("dotenv"));
const express_1 = __importDefault(require("express"));
const app = (0, express_1.default)();
const MAX_RETRIES = 3; // Maximum number of retries
// Health check endpoint
app.get('/check', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield executeWithRetry(check, MAX_RETRIES);
        res.status(200).send('OK');
    }
    catch (error) {
        res.status(400).send('Error while checking meals.');
    }
}));
dotenv.config();
// puppeteer.use(StealthPlugin());
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
function executeWithRetry(fn, retries) {
    return __awaiter(this, void 0, void 0, function* () {
        let attempt = 0;
        while (attempt < retries) {
            try {
                console.log(`Attempt ${attempt + 1} of ${retries}`);
                yield fn();
                console.log("Function executed successfully.");
                return; // Exit if successful
            }
            catch (error) {
                attempt++;
                console.error(`Error on attempt ${attempt}:`, error);
                if (attempt >= retries) {
                    console.error("Max retries reached. Aborting.");
                    return; // Stop retrying
                }
                else {
                    console.log("Retrying...");
                }
            }
        }
    });
}
/**
 * Main check function to execute Puppeteer automation
 */
function check() {
    return __awaiter(this, void 0, void 0, function* () {
        const browser = yield chrome_aws_lambda_1.default.puppeteer.launch({
            defaultViewport: null,
            headless: true,
            args: ["--no-sandbox", "--disable-setuid-sandbox", "--start-maximized"],
            timeout: 0,
        });
        const page = yield browser.newPage();
        const url = "https://al-zahraa.mans.edu.eg/studentLogin";
        try {
            console.log(`Navigating to ${url}...`);
            yield page.goto(url, { waitUntil: "networkidle2" });
            yield page.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36");
            console.log("Navigation successful.");
            yield page.type('input[name="txtStudentID"]', `${process.env.NID}`);
            yield page.type('input[name="txtStudentPassword"]', `${process.env.PASS}`);
            yield page.click(".account-btn");
            yield page.waitForNavigation();
            yield page.waitForSelector("#sidebar-menu > ul > li:nth-child(4) > a");
            yield page.waitForSelector("a#getMeals");
            yield page.click("#sidebar-menu > ul > li:nth-child(4) > a");
            yield page.click("a#getMeals", { delay: 1000 });
            yield page.click("a#getMeals");
            yield page.waitForSelector("table", { timeout: 0 });
            yield page.$$eval("table table.fc-scrollgrid-sync-table > tbody td.fc-day-future div.fc-daygrid-day-bg label > input", (checkboxes) => {
                return checkboxes.map((checkbox) => {
                    if (!checkbox.checked) {
                        checkbox.checked = true;
                    }
                });
            });
            const checkedStatus = yield page.$$eval("table table.fc-scrollgrid-sync-table > tbody td.fc-day-future div.fc-daygrid-day-bg label > input", (checkboxes) => {
                return checkboxes.map((checkbox) => ({
                    date: new Date().toLocaleString("en-ca"),
                    checked: checkbox.checked,
                }));
            });
            console.log(checkedStatus);
            yield page.click(".fc-myCustomButton-button.fc-button.fc-button-primary");
        }
        catch (error) {
            console.error("Error during execution:", error);
            throw error; // Propagate error for retry logic
        }
        finally {
            yield browser.close();
        }
    });
}
const port = parseInt(process.env.PORT || '8000', 10);
app.listen(port, '0.0.0.0', () => {
    console.log(`Health check server listening on port ${port}`);
});
