# Findings - Selenium Java to Playwright JS/TS Converter

## Research & Discoveries

### Common Mapping Patterns (Selenium Java -> Playwright TS)
| Selenium Command | Playwright Equivalent |
|------------------|-----------------------|
| `driver.get(url)` | `await page.goto(url)` |
| `driver.findElement(By.id("..."))` | `page.locator('#...')` |
| `element.sendKeys("...")` | `await element.fill('...')` |
| `element.click()` | `await element.click()` |
| `WebDriverWait` | `await page.waitForSelector(...)` |
| `@Test` (TestNG/JUnit) | `test('...', async ({ page }) => { ... })` |

### Architectural Patterns
- **Page Object Model:** Both support POM. Java uses `@FindBy`, TS uses `this.locator(...)` in constructors.
- **Assertions:** Java uses `Assert.assertEquals`, Playwright uses `expect(locator).toHaveText(...)`.

## Constraints & Challenges
- Handling complex Java logic (loops, utility classes) in the converter.
- Mapping custom Selenium frameworks/wrappers.
- Synchronization differences (Implicit vs. Auto-waiting).
