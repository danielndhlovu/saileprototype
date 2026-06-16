from playwright.sync_api import sync_playwright
import os

def run_cuj(page):
    page.set_viewport_size({"width": 1280, "height": 800})
    page.goto("http://localhost:3000")
    page.wait_for_timeout(2000)

    # Login
    page.locator("#login-email").fill("isaac@saile.mw")
    page.locator("#login-password").fill("password123")
    page.get_by_role("button", name="Sign In").click()
    page.wait_for_timeout(3000)

    # Check Dashboard
    page.screenshot(path="verification/screenshots/dashboard.png")

    # Check Clients
    page.click("a[href='#/clients']")
    page.wait_for_timeout(2000)
    page.screenshot(path="verification/screenshots/clients.png")

    # Check Loans
    page.click("a[href='#/loans']")
    page.wait_for_timeout(2000)
    page.screenshot(path="verification/screenshots/loans.png")

    # Check Savings
    page.click("a[href='#/savings']")
    page.wait_for_timeout(2000)
    page.screenshot(path="verification/screenshots/savings.png")

    # Check Reports
    page.click("a[href='#/reports']")
    page.wait_for_timeout(2000)
    # Generate one report
    page.get_by_role("button", name="Generate").first.click()
    page.wait_for_timeout(2000)
    page.screenshot(path="verification/screenshots/reports_detail.png")

    # Check Settings
    page.click("a[href='#/settings']")
    page.wait_for_timeout(2000)
    page.screenshot(path="verification/screenshots/settings_general.png")

    # Run Migration - direct hash navigation for reliable demo
    page.goto("http://localhost:3000/#/migration")
    page.wait_for_timeout(2000)
    page.click("#btn-run-migration")
    page.wait_for_timeout(10000) # Wait for simulation to finish
    page.screenshot(path="verification/screenshots/migration_done.png")

    page.wait_for_timeout(1000)

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(
            record_video_dir="verification/videos"
        )
        page = context.new_page()
        try:
            run_cuj(page)
        finally:
            context.close()
            browser.close()
