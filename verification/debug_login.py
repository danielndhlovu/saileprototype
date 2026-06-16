from playwright.sync_api import sync_playwright
import os

def run_cuj(page):
    page.goto("http://localhost:3000")
    page.wait_for_timeout(2000)

    # Try login with isaac@saile.mw
    page.locator("#login-email").fill("isaac@saile.mw")
    page.locator("#login-password").fill("password123")
    page.get_by_role("button", name="Sign In").click()
    page.wait_for_timeout(5000)

    # Click Settings
    page.click("a[href='#/settings']")
    page.wait_for_timeout(2000)

    # Check buttons
    btns = page.eval_on_selector_all("button", "elements => elements.map(e => e.innerText)")
    print("Buttons found:", btns)

    page.screenshot(path="verification/screenshots/debug_settings_btns.png")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={"width": 1280, "height": 800})
        page = context.new_page()
        try:
            run_cuj(page)
        finally:
            context.close()
            browser.close()
