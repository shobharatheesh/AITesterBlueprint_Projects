import { test, expect } from '@playwright/test';

// Import: org.openqa.selenium.WebDriver
// Import: org.openqa.selenium.chrome.ChromeDriver

public class SimpleSeleniumTest {

    public static void main(String[] args) {

        // Create WebDriver object
        // WebDriver Instance

        // Open a website
        await page.goto("https://www.google.com");

        // Print page title
        System.out.println("Page Title is: " + driver.getTitle());

        // Close browser
        await browser.close();
    }
}