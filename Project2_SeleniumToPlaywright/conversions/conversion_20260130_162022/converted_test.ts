import { test, expect } from '@playwright/test';


    test("Converted Test", async ({ page }) => {
    // Method: loginTest {
        await page.goto("https://example.com");
        await page.locator('#' + "user").fill("admin");
        await page.locator('#' + "pass").fill("123");
        await page.locator('#' + "submit").click();
    }
    
});