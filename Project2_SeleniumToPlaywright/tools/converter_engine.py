import re
import os
import datetime

class SeleniumToPlaywrightConverter:
    def __init__(self):
        self.mappings = [
            (r'package\s+(.*?);', r'// Package: \1'),
            (r'import\s+(.*?);', r'// Import: \1'),
            (r'public\s+class\s+(\w+)\s*\{', r'// Java Class: \1'),
            (r'public\s+static\s+void\s+main\s*\(String\[\]\s+args\)\s*\{', r'test("Main Execution Thread", async ({ page }) => {'),
            (r'WebDriver\s+(\w+)\s*=\s*new\s+\w+\(\);', r'// \1 initialized by Playwright'),
            (r'driver\.get\((.*?)\)', r'await page.goto(\1)'),
            (r'driver\.findElement\(By\.id\((.*?)\)\)', r"page.locator('#' + \1)"),
            (r'driver\.findElement\(By\.name\((.*?)\)\)', r"page.locator('[name=' + \1 + ']')"),
            (r'driver\.findElement\(By\.xpath\((.*?)\)\)', r"page.locator(\1)"),
            (r'driver\.findElement\(By\.cssSelector\((.*?)\)\)', r"page.locator(\1)"),
            (r'driver\.findElement\(By\.className\((.*?)\)\)', r"page.locator('.' + \1)"),
            (r'driver\.getTitle\(\)', r'await page.title()'),
            (r'driver\.getCurrentUrl\(\)', r'page.url()'),
            (r'System\.out\.println\((.*?)\)', r'console.log(\1)'),
            (r'driver\.quit\(\)', r'// driver.quit() - Playwright handles cleanup'),
            (r'driver\.close\(\)', r'await page.close()'),
            (r'\.sendKeys\((.*?)\)', r'.fill(\1)'),
            (r'\.click\(\)', r'.click()'),
            (r'\.clear\(\)', r'.fill("")'),
            (r'\.getText\(\)', r'.innerText()'),
            (r'\.getAttribute\((.*?)\)', r'.getAttribute(\1)'),
            (r'\.isDisplayed\(\)', r'.isVisible()'),
            (r'Assert\.assertEquals\((.*?),(.*?)\)', r'expect(\2).toBe(\1)'),
            (r'Assert\.assertTrue\((.*?)\)', r'expect(\1).toBeTruthy()'),
            (r'String\s+', r'let '),
            (r'int\s+', r'let '),
            (r'boolean\s+', r'let '),
            (r'@Test', r'test("Converted Test", async ({ page }) => {'),
            (r'@BeforeMethod', r'test.beforeEach(async ({ page }) => {'),
            (r'@AfterMethod', r'test.afterEach(async ({ page }) => {'),
            (r'public\s+void\s+(\w+)\s*\(\)\s*\{', r'async function \1(page) {'),
            (r'WebDriver\s+(.*?);', r'// WebDriver Instance: \1'),
            (r'WebElement\s+(\w+)\s*=\s*', r'const \1 = '),
        ]

    def convert(self, java_code, target_lang='typescript'):
        lines = java_code.split('\n')
        converted_lines = []
        in_test_method = False
        
        # Pre-check for structural entry points
        has_test = "@Test" in java_code or "public static void main" in java_code

        for line in lines:
            # Simple mapping
            new_line = line
            for pattern, replacement in self.mappings:
                new_line = re.sub(pattern, replacement, new_line)
            
            # Detect entering a test method or main
            if "test(" in new_line or ".beforeEach(" in new_line:
                in_test_method = True
            
            # Remove lines that are just closing braces for class/package (heuristically)
            if new_line.strip() == "}" and not in_test_method:
                continue
                
            converted_lines.append(new_line)
            
            # If we were in a method and hit a brace, we might still be in it (very naive)
            # For simplicity, we just keep appending until the end of lines
            
        # Add awaits to actions and clean up remains
        final_lines = []
        for line in converted_lines:
            new_line = line
            # Force await on Playwright actions
            actions = ['page.locator', 'page.goto', 'page.title', 'page.url', 'page.innerText', 'page.isVisible']
            if any(action in new_line for action in actions):
                if not new_line.strip().startswith('await') and not new_line.strip().startswith('//') and not 'const' in new_line and not 'let' in new_line:
                    indent_count = len(new_line) - len(new_line.lstrip())
                    new_line = (' ' * indent_count) + 'await ' + new_line.lstrip()
            
            # Clean up semicolon if line is a comment
            if new_line.strip().startswith('//') and new_line.strip().endswith(';'):
                new_line = new_line.replace(';', '')
                
            final_lines.append(new_line)

        # Basic wrapping logic
        if target_lang == 'typescript':
            header = "import { test, expect } from '@playwright/test';\n\n"
        else:
            header = "const { test, expect } = require('@playwright/test');\n\n"
            
        result_body = "\n".join(final_lines)
        
        # If the code already has a test block, just ensure it's closed
        if has_test:
            if not result_body.strip().endswith('});'):
                result_body += "\n});"
            return header + result_body
        else:
            # Wrap entire procedural logic in a default test
            return header + "test('Automated Conversion', async ({ page }) => {\n" + result_body + "\n});"

def run_conversion(code, target_root, lang='typescript'):
    converter = SeleniumToPlaywrightConverter()
    result = converter.convert(code, lang)
    
    timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
    folder_name = f"conversion_{timestamp}"
    full_path = os.path.join(target_root, folder_name)
    os.makedirs(full_path, exist_ok=True)
    
    file_ext = "ts" if lang == "typescript" else "js"
    file_name = f"converted_test.{file_ext}"
    file_path = os.path.join(full_path, file_name)
    
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(result)
        
    return result, file_path

if __name__ == "__main__":
    sample_java = """
    package com.example;
    import org.openqa.selenium.By;
    import org.openqa.selenium.WebDriver;
    import org.testng.Assert;
    import org.testng.annotations.Test;

    public class MyTest {
        @Test
        public void testLogin() {
            driver.get("http://example.com");
            driver.findElement(By.id("username")).sendKeys("admin");
            driver.findElement(By.id("password")).sendKeys("password");
            driver.findElement(By.id("login")).click();
            Assert.assertEquals("Welcome", "Welcome");
        }
    }
    """
    out = SeleniumToPlaywrightConverter().convert(sample_java)
    print(out)
