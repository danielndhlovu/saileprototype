const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('http://localhost:8000');

  // Login
  await page.fill('input[type="email"]', 'isaac@saile.mw');
  await page.fill('input[type="password"]', 'password123');
  await page.click('button:has-text("Sign In")');
  await page.waitForSelector('nav');

  // Go to Savings
  await page.evaluate(() => window.location.hash = '#/savings');
  await page.waitForTimeout(1000);
  await page.screenshot({ path: 'savings.png', fullPage: true });

  // Go to Reports
  await page.evaluate(() => window.location.hash = '#/reports');
  await page.waitForTimeout(1000);
  await page.screenshot({ path: 'reports.png', fullPage: true });

  // Go to Settings to see Backup/Restore
  await page.evaluate(() => window.location.hash = '#/settings');
  await page.waitForTimeout(1000);
  await page.screenshot({ path: 'settings.png', fullPage: true });

  await browser.close();
})();
