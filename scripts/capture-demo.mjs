import { chromium } from "playwright";
import { mkdir } from "fs/promises";

const BASE = "http://127.0.0.1:43123";
const OUT = "/opt/cursor/artifacts/screenshots";

await mkdir(OUT, { recursive: true });

const browser = await chromium.launch({
  headless: true,
  executablePath: "/usr/local/bin/google-chrome",
  args: ["--no-sandbox", "--disable-dev-shm-usage"],
});
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

await page.goto(`${BASE}/login`, { waitUntil: "networkidle" });
await page.screenshot({ path: `${OUT}/01-login.png`, fullPage: true });

await page.fill("#email", "admin@technokeys.com");
await page.fill("#password", "TechnoKeys2026!");
await page.click('button[type="submit"]');
await page.waitForURL("**/");
await page.waitForTimeout(500);
await page.screenshot({ path: `${OUT}/02-dashboard.png`, fullPage: true });

await page.goto(`${BASE}/invoices/new`, { waitUntil: "networkidle" });
await page.fill("#customerName", "Summit Body Shop");
await page.fill("#vehicleYear", "2019");
await page.fill("#vehicleMake", "Chevrolet");
await page.fill("#vehicleModel", "Silverado");
await page.selectOption("select", { label: "Diagnostic Scanning" }).catch(async () => {
  const selects = page.locator("select");
  await selects.nth(0).selectOption({ label: "Diagnostic Scanning" });
});
await page.locator('input[placeholder="0.00"]').first().fill("175");
await page.locator("select").nth(1).selectOption("PAID");
await page.screenshot({ path: `${OUT}/03-create-invoice.png`, fullPage: true });
await page.click('button[type="submit"]');
await page.waitForURL("**/invoices/**");
await page.waitForTimeout(1500);
await page.screenshot({ path: `${OUT}/04-invoice-detail.png`, fullPage: true });

await page.goto(`${BASE}/invoices?q=Summit`, { waitUntil: "networkidle" });
await page.screenshot({ path: `${OUT}/05-history-search.png`, fullPage: true });

await page.goto(`${BASE}/settings`, { waitUntil: "networkidle" });
await page.screenshot({ path: `${OUT}/06-settings.png`, fullPage: true });

console.log("Screenshots saved to", OUT);
await browser.close();
