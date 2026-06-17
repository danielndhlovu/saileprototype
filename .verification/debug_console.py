from playwright.sync_api import sync_playwright
import os

def run_cuj(page):
    page.on("console", lambda msg: print(f"CONSOLE: {msg.text}"))
    page.on("pageerror", lambda exc: print(f"PAGE ERROR: {exc}"))

    page.goto("http://localhost:3000")
    page.wait_for_timeout(5000)
    page.screenshot(path="verification/screenshots/debug_console.png")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context()
        page = context.new_page()
        try:
            run_cuj(page)
        finally:
            context.close()
            browser.close()
