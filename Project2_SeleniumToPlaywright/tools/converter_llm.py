import os
import sys
import datetime

# Add current directory to path for absolute imports
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from ollama_client import OllamaClient

class LLMConverter:
    def __init__(self, model="gemma3:1b"):
        self.client = OllamaClient(model=model)
        self.system_prompt = """
You are an expert Automation Engineer specializing in Selenium Java and Playwright.
Your mission is to convert Selenium Java test scripts into high-quality Playwright TypeScript/JavaScript.

STRICT CONVERSION RULES:
1. REMOVE ALL JAVA BOILERPLATE: Strip out 'package', 'import', 'public class', and 'public static void main'.
2. WRAP IN TEST BLOCK: Always wrap the converted logic in 'test("Converted Test", async ({ page }) => { ... });'.
3. ASYNC/AWAIT: Ensure every Playwright action (goto, click, fill, title, url) is prefixed with 'await'.
4. LOCATORS: Use 'page.locator()' for all element interactions.
5. CONSOLE LOGS: Map 'System.out.println' to 'console.log'.
6. NO EXPLANATIONS: Return ONLY the raw code. Do NOT use markdown code blocks or conversational text.
7. PARAMETER MAPPING: Use 'page' as the primary interaction object.
"""

    def convert(self, java_code, lang="typescript"):
        prompt = f"Convert the following Selenium Java code to Playwright {lang}:\n\n{java_code}"
        result = self.client.generate(prompt, system_prompt=self.system_prompt)
        
        # Strip potential markdown code blocks if the LLM ignores instructions
        if "```" in result:
            lines = result.split("\n")
            result = "\n".join([l for l in lines if not l.strip().startswith("```")])
            
        return result.strip()

def run_llm_conversion(code, target_root, lang='typescript', model='gemma3:1b'):
    converter = LLMConverter(model=model)
    result = converter.convert(code, lang)
    
    timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
    folder_name = f"llm_conversion_{timestamp}"
    full_path = os.path.join(target_root, folder_name)
    os.makedirs(full_path, exist_ok=True)
    
    file_ext = "ts" if lang == "typescript" else "js"
    file_name = f"converted_test.{file_ext}"
    file_path = os.path.join(full_path, file_name)
    
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(result)
        
    return result, file_path
