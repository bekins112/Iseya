import puppeteer from "puppeteer";
import pg from "pg";
import crypto from "crypto";
import sign from "cookie-signature";

const BASE = "http://localhost:5000";
const SECRET = process.env.SESSION_SECRET;
const APPLICANT_ID = "1dfe62a7-de89-45ef-8760-76738cda0049";
const JOB_SLUG = "test-job-bpu3-5";

const c = new pg.Client({ connectionString: process.env.DATABASE_URL });
await c.connect();
const u = (await c.query("SELECT * FROM users WHERE id=$1", [APPLICANT_ID])).rows[0];
const user = { ...u, firstName: u.first_name, lastName: u.last_name };
const sid = crypto.randomBytes(24).toString("hex");
const expire = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
const sess = {
  cookie: { originalMaxAge: 7*24*60*60*1000, expires: expire.toISOString(), httpOnly:true, path:"/", sameSite:"lax", secure:false },
  userId: u.id, passport: { user },
};
await c.query("INSERT INTO sessions (sid,sess,expire) VALUES ($1,$2,$3) ON CONFLICT (sid) DO UPDATE SET sess=EXCLUDED.sess, expire=EXCLUDED.expire", [sid, sess, expire]);
const signed = "s:" + sign.sign(sid, SECRET);

const browser = await puppeteer.launch({ headless: "new", args: ["--no-sandbox","--disable-setuid-sandbox"] });
const page = await browser.newPage();
await page.setViewport({ width: 1280, height: 800 });

await page.goto(BASE + "/", { waitUntil: "networkidle2" });
await page.setCookie({ name:"connect.sid", value:signed, url:BASE, httpOnly:true, sameSite:"Lax" });

// Go to job detail
await page.goto(BASE + "/jobs/" + JOB_SLUG, { waitUntil: "networkidle2" });

// Wait for any popups, then dismiss them
await new Promise(r => setTimeout(r, 2500));

// Inject CSS to hide popups and cookie banner
await page.addStyleTag({ content: `
  vite-error-overlay, vite-plugin-checker-error-overlay { display: none !important; }
  [class*="cookie"], [id*="cookie"] { display: none !important; }
` });
// Click Close on the agent popup
await page.evaluate(() => {
  const btns = Array.from(document.querySelectorAll("button"));
  for (const b of btns) {
    const t = (b.textContent || "").trim().toLowerCase();
    if (t === "close") b.click();
  }
});

await new Promise(r => setTimeout(r, 800));

// Re-take job detail without popup
await page.screenshot({ path: "attached_assets/walkthrough/applicant/06-job-detail.png", fullPage: true });
console.log("re-shot job detail");

// Click "Apply Now" button by text
await page.evaluate(() => {
  const btns = Array.from(document.querySelectorAll("button, a"));
  const apply = btns.find(b => /apply now/i.test(b.textContent || ""));
  if (apply) apply.click();
});

await new Promise(r => setTimeout(r, 1500));
await page.screenshot({ path: "attached_assets/walkthrough/applicant/07-apply-modal.png", fullPage: false });
console.log("re-shot apply modal");

await browser.close();
await c.end();
