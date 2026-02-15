import requests
import json

url = "http://localhost:5001/convert"
payload = {
    "selenium_code": """
    @Test
    public void loginTest() {
        driver.get("https://example.com");
        driver.findElement(By.id("user")).sendKeys("admin");
        driver.findElement(By.id("pass")).sendKeys("123");
        driver.findElement(By.id("submit")).click();
    }
    """,
    "target_language": "typescript",
    "mode": "regex"
}

try:
    print("Sending request to API...")
    response = requests.post(url, json=payload, timeout=10)
    print(f"Status: {response.status_code}")
    print("Response Body:")
    print(json.dumps(response.json(), indent=2))
except Exception as e:
    print(f"Error: {e}")
