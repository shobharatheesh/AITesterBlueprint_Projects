import { test, expect } from '@playwright/test';

test("Main Execution Thread", async ({ page }) => {
    // Navigate to Google
    await page.goto("https://www.google.com");

    // Log the page title
    const title = await page.title();
    console.log("Page Title is: " + title);

    // Assert that the title is correct
    await expect(page).toHaveTitle(/Google/);
});
