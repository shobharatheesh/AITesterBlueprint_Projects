from tools.converter_engine import SeleniumToPlaywrightConverter

java_code = """
@Test
public void loginTest() {
    driver.get("https://opensource-demo.orangehrmlive.com/");
    driver.findElement(By.id("txtUsername")).sendKeys("Admin");
    driver.findElement(By.id("txtPassword")).sendKeys("admin123");
    driver.findElement(By.id("btnLogin")).click();
}
"""

converter = SeleniumToPlaywrightConverter()
result = converter.convert(java_code)
print("--- CONVERTED CODE ---")
print(result)
print("----------------------")
