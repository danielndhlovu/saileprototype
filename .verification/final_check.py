import os
from playwright.sync_api import sync_playwright

def run_cuj(page):
    file_path = "file://" + os.path.abspath("index.html")
    page.goto(file_path)
    page.wait_for_timeout(1000)
    page.fill("#login-email", "elias@saile.mw")
    page.fill("#login-password", "password123")
    page.get_by_role("button", name="Sign In").click()
    page.wait_for_timeout(2000)
    page.screenshot(path="verification/screenshots/final_state_md.png")

    # Check reports
    page.evaluate("window.location.hash = '#/reports'")
    page.wait_for_timeout(1000)
    page.screenshot(path="verification/screenshots/final_state_reports.png")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={"width": 1280, "height": 800})
        page = context.new_page()
        run_cuj(page)
        context.close()
        browser.close()
