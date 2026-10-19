import { chromium } from "playwright";
import { mkdir } from "fs/promises";

const BASE = "http://127.0.0.1:43123";
const OUT = "/opt/cursor/artifacts";

await mkdir(OUT, { recursive: true });

const browser = await chromium.launch({
  headless: true,
  executablePath: "/usr/local/bin/google-chrome",
  args: ["--no-sandbox", "--disable-dev-shm-usage"],
});

const context = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  recordVideo: { dir: `${OUT}/videos`, size: { width: 1440, height: 900 } },
});

const page = await context.newPage();

await page.goto(`${BASE}/login`, { waitUntil: "networkidle" });
await page.waitForTimeout(600);
await page.fill("#email", "admin@technokeys.com");
await page.fill("#password", "TechnoKeys2026!");
await page.click('button[type="submit"]');
await page.waitForURL("**/");
await page.waitForTimeout(800);

await page.click('a[href="/invoices/new"]');
await page.waitForURL("**/invoices/new");
await page.fill("#customerName", "Precision Auto Electronics");
await page.fill("#vehicleYear", "2023");
await page.fill("#vehicleMake", "BMW");
await page.fill("#vehicleModel", "330i");
const selects = page.locator("select");
await selects.nth(0).selectOption({ label: "ADAS Calibration" });
await page.locator('input[placeholder="0.00"]').first().fill("425");
await selects.nth(1).selectOption("PAID");
await page.waitForTimeout(400);
await page.click('button[type="submit"]');
await page.waitForURL("**/invoices/**");
await page.waitForTimeout(1800);

await page.goto(`${BASE}/invoices?q=Precision`, { waitUntil: "networkidle" });
await page.waitForTimeout(800);
await page.goto(`${BASE}/settings`, { waitUntil: "networkidle" });
await page.waitForTimeout(800);

const video = page.video();
await context.close();
await browser.close();

if (video) {
  const path = await video.path();
  const { copyFile } = await import("fs/promises");
  await copyFile(path, `${OUT}/techno-keys-invoice-demo.webm`);
  console.log("Saved", `${OUT}/techno-keys-invoice-demo.webm`);
}
