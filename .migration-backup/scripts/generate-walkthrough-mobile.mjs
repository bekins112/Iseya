import puppeteer from "puppeteer";
import pg from "pg";
import crypto from "crypto";
import sign from "cookie-signature";
import fs from "fs";
import path from "path";

const BASE = "http://localhost:5000";
const SECRET = process.env.SESSION_SECRET;
const DB = process.env.DATABASE_URL;
if (!SECRET || !DB) {
  console.error("Missing SESSION_SECRET or DATABASE_URL");
  process.exit(1);
}

const EMPLOYER_ID = "8f6d76a0-fcf7-44ff-be02-92e9b9cd9726";
const APPLICANT_ID = "1dfe62a7-de89-45ef-8760-76738cda0049";
const JOB_SLUG = "test-job-bpu3-5";

const OUT_EMP = "attached_assets/walkthrough/mobile-employer";
const OUT_APP = "attached_assets/walkthrough/mobile-applicant";
fs.mkdirSync(OUT_EMP, { recursive: true });
fs.mkdirSync(OUT_APP, { recursive: true });

// iPhone 13 / 14 dimensions
const MOBILE = {
  width: 390,
  height: 844,
  deviceScaleFactor: 2,
  isMobile: true,
  hasTouch: true,
};
const UA = "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1";

const client = new pg.Client({ connectionString: DB });
await client.connect();

async function getUser(id) {
  const r = await client.query("SELECT * FROM users WHERE id=$1", [id]);
  const u = r.rows[0];
  return {
    ...u,
    firstName: u.first_name,
    lastName: u.last_name,
    profileImageUrl: u.profile_image_url,
    isVerified: u.is_verified,
    companyName: u.company_name,
    emailVerified: u.email_verified,
    createdAt: u.created_at,
    updatedAt: u.updated_at,
  };
}

async function createSessionForUser(user) {
  const sid = crypto.randomBytes(24).toString("hex");
  const expire = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  const sess = {
    cookie: { originalMaxAge: 7*24*60*60*1000, expires: expire.toISOString(), httpOnly:true, path:"/", sameSite:"lax", secure:false },
    userId: user.id, passport: { user },
  };
  await client.query(
    `INSERT INTO sessions (sid, sess, expire) VALUES ($1, $2, $3)
     ON CONFLICT (sid) DO UPDATE SET sess=EXCLUDED.sess, expire=EXCLUDED.expire`,
    [sid, sess, expire]
  );
  return "s:" + sign.sign(sid, SECRET);
}

async function dismissOverlays(page) {
  // Hide popups, cookie banner via CSS (avoid DOM manipulation that breaks React)
  try {
    await page.addStyleTag({ content: `
      vite-error-overlay, vite-plugin-checker-error-overlay { display: none !important; }
      [class*="cookie" i], [id*="cookie" i] { display: none !important; }
      [data-testid*="popup" i], [data-testid*="ad" i], [class*="agent-popup" i] { display: none !important; }
    `}).catch(() => {});
    // Click close on any popup
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll("button"));
      for (const b of btns) {
        const t = (b.textContent || "").trim().toLowerCase();
        if (t === "close" || t === "essential only") b.click();
      }
    });
  } catch {}
}

async function shoot(page, dir, name, opts = {}) {
  await new Promise((r) => setTimeout(r, opts.wait ?? 1000));
  await dismissOverlays(page);
  await new Promise((r) => setTimeout(r, 400));
  const file = path.join(dir, name + ".png");
  await page.screenshot({ path: file, fullPage: opts.full ?? false });
  console.log("  shot:", file);
  return file;
}

async function setSession(page, signed) {
  await page.setCookie({
    name: "connect.sid", value: signed, url: BASE, httpOnly: true, sameSite: "Lax",
  });
}

async function newMobilePage() {
  const page = await browser.newPage();
  await page.setViewport(MOBILE);
  await page.setUserAgent(UA);
  return page;
}

const browser = await puppeteer.launch({
  headless: "new",
  args: ["--no-sandbox", "--disable-setuid-sandbox"],
});

try {
  // ============ EMPLOYER FLOW (MOBILE) ============
  console.log("\n== EMPLOYER FLOW (MOBILE) ==");
  const employer = await getUser(EMPLOYER_ID);
  const empSigned = await createSessionForUser(employer);

  let page = await newMobilePage();

  await page.goto(BASE + "/", { waitUntil: "networkidle2", timeout: 30000 });
  await shoot(page, OUT_EMP, "01-landing");

  await page.goto(BASE + "/for-employers", { waitUntil: "networkidle2", timeout: 30000 });
  await shoot(page, OUT_EMP, "02-for-employers");

  await page.goto(BASE + "/register?role=employer", { waitUntil: "networkidle2", timeout: 30000 });
  await shoot(page, OUT_EMP, "03-register");

  await setSession(page, empSigned);

  await page.goto(BASE + "/dashboard", { waitUntil: "networkidle2", timeout: 30000 });
  await shoot(page, OUT_EMP, "04-dashboard");

  await page.goto(BASE + "/manage-jobs", { waitUntil: "networkidle2", timeout: 30000 });
  await shoot(page, OUT_EMP, "05-manage-jobs");

  await page.goto(BASE + "/post-job", { waitUntil: "networkidle2", timeout: 30000 });
  await shoot(page, OUT_EMP, "06-post-job-empty");

  // Fill form
  try {
    const titleSel = 'input[name="title"], input[id*="title"], input[placeholder*="title" i]';
    await page.waitForSelector(titleSel, { timeout: 4000 });
    await page.click(titleSel);
    await page.type(titleSel, "Experienced House Cleaner Needed in Lekki");
    const descSel = 'textarea[name="description"], textarea[id*="description"]';
    if (await page.$(descSel)) {
      await page.click(descSel);
      await page.type(descSel, "We are looking for a thorough and reliable house cleaner to maintain a 4-bedroom home in Lekki Phase 1. Duties include sweeping, mopping, dusting, laundry, and kitchen cleanup.");
    }
  } catch (e) {
    console.log("  (skipped fill):", e.message);
  }
  await shoot(page, OUT_EMP, "07-post-job-filled", { full: true });

  await page.goto(BASE + "/applicants", { waitUntil: "networkidle2", timeout: 30000 });
  await shoot(page, OUT_EMP, "08-applicants-inbox");

  await page.goto(BASE + "/profile", { waitUntil: "networkidle2", timeout: 30000 });
  await shoot(page, OUT_EMP, "09-profile");

  await page.close();

  // ============ APPLICANT FLOW (MOBILE) ============
  console.log("\n== APPLICANT FLOW (MOBILE) ==");
  const applicant = await getUser(APPLICANT_ID);
  const appSigned = await createSessionForUser(applicant);

  page = await newMobilePage();

  await page.goto(BASE + "/", { waitUntil: "networkidle2", timeout: 30000 });
  await shoot(page, OUT_APP, "01-landing");

  await page.goto(BASE + "/for-applicants", { waitUntil: "networkidle2", timeout: 30000 });
  await shoot(page, OUT_APP, "02-for-applicants");

  await page.goto(BASE + "/register?role=applicant", { waitUntil: "networkidle2", timeout: 30000 });
  await shoot(page, OUT_APP, "03-register");

  await setSession(page, appSigned);

  await page.goto(BASE + "/dashboard", { waitUntil: "networkidle2", timeout: 30000 });
  await shoot(page, OUT_APP, "04-dashboard");

  await page.goto(BASE + "/browse-jobs", { waitUntil: "networkidle2", timeout: 30000 });
  await shoot(page, OUT_APP, "05-browse-jobs");

  await page.goto(BASE + "/jobs/" + JOB_SLUG, { waitUntil: "networkidle2", timeout: 30000 });
  await shoot(page, OUT_APP, "06-job-detail", { full: true });

  // Click Apply Now
  try {
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll("button, a"));
      const apply = btns.find(b => /apply now/i.test(b.textContent || ""));
      if (apply) apply.click();
    });
    await new Promise((r) => setTimeout(r, 1500));
  } catch (e) { console.log("  (apply click):", e.message); }
  await shoot(page, OUT_APP, "07-apply-modal");

  await page.goto(BASE + "/my-applications", { waitUntil: "networkidle2", timeout: 30000 });
  await shoot(page, OUT_APP, "08-my-applications");

  await page.close();
} catch (e) {
  console.error("Walkthrough error:", e);
  process.exitCode = 1;
} finally {
  await browser.close();
  await client.end();
  console.log("\nDone.");
}
