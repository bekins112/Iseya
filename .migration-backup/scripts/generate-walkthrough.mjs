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

const EMPLOYER_ID = "8f6d76a0-fcf7-44ff-be02-92e9b9cd9726"; // yara247logistics
const APPLICANT_ID = "1dfe62a7-de89-45ef-8760-76738cda0049"; // testapplicant
const JOB_ID = 5;
const JOB_SLUG = "test-job-bpu3-5";

const OUT_EMP = "attached_assets/walkthrough/employer";
const OUT_APP = "attached_assets/walkthrough/applicant";

const client = new pg.Client({ connectionString: DB });
await client.connect();

async function getUser(id) {
  const r = await client.query("SELECT * FROM users WHERE id=$1", [id]);
  if (!r.rows[0]) throw new Error("User not found: " + id);
  // Convert snake_case to camelCase for the few fields the frontend may need
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
    cookie: {
      originalMaxAge: 7 * 24 * 60 * 60 * 1000,
      expires: expire.toISOString(),
      httpOnly: true,
      path: "/",
      sameSite: "lax",
      secure: false,
    },
    userId: user.id,
    passport: { user },
  };
  await client.query(
    `INSERT INTO sessions (sid, sess, expire) VALUES ($1, $2, $3)
     ON CONFLICT (sid) DO UPDATE SET sess=EXCLUDED.sess, expire=EXCLUDED.expire`,
    [sid, sess, expire]
  );
  // express-session signs as: "s:" + sid + "." + base64(hmac256(sid, secret))
  const signed = "s:" + sign.sign(sid, SECRET);
  return { sid, signed };
}

async function shoot(page, dir, name, opts = {}) {
  const file = path.join(dir, name + ".png");
  await new Promise((r) => setTimeout(r, opts.wait ?? 800));
  await page.screenshot({ path: file, fullPage: opts.full ?? false });
  console.log("  shot:", file);
  return file;
}

async function setSession(page, signed) {
  await page.setCookie({
    name: "connect.sid",
    value: signed,
    url: BASE,
    httpOnly: true,
    sameSite: "Lax",
  });
}

const browser = await puppeteer.launch({
  headless: "new",
  args: ["--no-sandbox", "--disable-setuid-sandbox"],
});

try {
  // ============ EMPLOYER FLOW ============
  console.log("\n== EMPLOYER FLOW ==");
  const employer = await getUser(EMPLOYER_ID);
  const empSess = await createSessionForUser(employer);

  let page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800, deviceScaleFactor: 1 });

  // 1: Landing — public marketing
  await page.goto(BASE + "/", { waitUntil: "networkidle2", timeout: 30000 });
  await shoot(page, OUT_EMP, "01-landing");

  // 2: For Employers page
  await page.goto(BASE + "/for-employers", { waitUntil: "networkidle2", timeout: 30000 });
  await shoot(page, OUT_EMP, "02-for-employers");

  // 3: Register page (sign-up form, role pre-selected)
  await page.goto(BASE + "/register?role=employer", { waitUntil: "networkidle2", timeout: 30000 });
  await shoot(page, OUT_EMP, "03-register");

  // Now switch to authenticated employer session
  await setSession(page, empSess.signed);

  // 4: Dashboard
  await page.goto(BASE + "/dashboard", { waitUntil: "networkidle2", timeout: 30000 });
  await shoot(page, OUT_EMP, "04-dashboard");

  // 5: Manage Jobs
  await page.goto(BASE + "/manage-jobs", { waitUntil: "networkidle2", timeout: 30000 });
  await shoot(page, OUT_EMP, "05-manage-jobs");

  // 6: Post Job - empty form
  await page.goto(BASE + "/post-job", { waitUntil: "networkidle2", timeout: 30000 });
  await shoot(page, OUT_EMP, "06-post-job-empty");

  // 7: Post Job - filled form (try to fill a few fields)
  try {
    const titleSel = 'input[name="title"], input[id*="title"], input[placeholder*="title" i]';
    await page.waitForSelector(titleSel, { timeout: 4000 });
    await page.click(titleSel);
    await page.type(titleSel, "Experienced House Cleaner Needed in Lekki");
    const descSel = 'textarea[name="description"], textarea[id*="description"]';
    if (await page.$(descSel)) {
      await page.click(descSel);
      await page.type(
        descSel,
        "We are looking for a thorough and reliable house cleaner to maintain a 4-bedroom home in Lekki Phase 1. Duties include sweeping, mopping, dusting, laundry, and kitchen cleanup. Must be punctual, trustworthy, and have at least 1 year experience."
      );
    }
    const salaryMin = 'input[name="salaryMin"], input[id*="salaryMin"], input[placeholder*="min" i]';
    if (await page.$(salaryMin)) {
      await page.click(salaryMin);
      await page.type(salaryMin, "30000");
    }
    const salaryMax = 'input[name="salaryMax"], input[id*="salaryMax"], input[placeholder*="max" i]';
    if (await page.$(salaryMax)) {
      await page.click(salaryMax);
      await page.type(salaryMax, "50000");
    }
  } catch (e) {
    console.log("  (skipped fill, no matching fields):", e.message);
  }
  await shoot(page, OUT_EMP, "07-post-job-filled", { full: true });

  // 8: Applications inbox (the "Applicants" list page)
  await page.goto(BASE + "/applicants", { waitUntil: "networkidle2", timeout: 30000 });
  await shoot(page, OUT_EMP, "08-applicants-inbox");

  // 9: Profile (employer manages company info)
  await page.goto(BASE + "/profile", { waitUntil: "networkidle2", timeout: 30000 });
  await shoot(page, OUT_EMP, "09-profile");

  await page.close();

  // ============ APPLICANT FLOW ============
  console.log("\n== APPLICANT FLOW ==");
  const applicant = await getUser(APPLICANT_ID);
  const appSess = await createSessionForUser(applicant);

  page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800, deviceScaleFactor: 1 });

  // 1: Landing
  await page.goto(BASE + "/", { waitUntil: "networkidle2", timeout: 30000 });
  await shoot(page, OUT_APP, "01-landing");

  // 2: For Applicants page
  await page.goto(BASE + "/for-applicants", { waitUntil: "networkidle2", timeout: 30000 });
  await shoot(page, OUT_APP, "02-for-applicants");

  // 3: Register page (applicant)
  await page.goto(BASE + "/register?role=applicant", { waitUntil: "networkidle2", timeout: 30000 });
  await shoot(page, OUT_APP, "03-register");

  // Authenticated applicant session
  await setSession(page, appSess.signed);

  // 4: Dashboard
  await page.goto(BASE + "/dashboard", { waitUntil: "networkidle2", timeout: 30000 });
  await shoot(page, OUT_APP, "04-dashboard");

  // 5: Browse jobs
  await page.goto(BASE + "/browse-jobs", { waitUntil: "networkidle2", timeout: 30000 });
  await shoot(page, OUT_APP, "05-browse-jobs");

  // 6: Job detail
  await page.goto(BASE + "/jobs/" + JOB_SLUG, { waitUntil: "networkidle2", timeout: 30000 });
  await shoot(page, OUT_APP, "06-job-detail", { full: true });

  // 7: Apply modal — try to click Apply button
  try {
    const applyBtn = await page.$('[data-testid="button-apply"], button:has-text("Apply")');
    if (applyBtn) {
      await applyBtn.click();
      await new Promise((r) => setTimeout(r, 1200));
    } else {
      // fallback: find any button containing "Apply"
      await page.evaluate(() => {
        const btns = Array.from(document.querySelectorAll("button"));
        const apply = btns.find((b) => /apply/i.test(b.textContent || ""));
        if (apply) apply.click();
      });
      await new Promise((r) => setTimeout(r, 1200));
    }
  } catch (e) {
    console.log("  (couldn't open apply modal):", e.message);
  }
  await shoot(page, OUT_APP, "07-apply-modal");

  // 8: My Applications
  await page.goto(BASE + "/my-applications", { waitUntil: "networkidle2", timeout: 30000 });
  await shoot(page, OUT_APP, "08-my-applications");

  // 9: Profile (applicant)
  await page.goto(BASE + "/profile", { waitUntil: "networkidle2", timeout: 30000 });
  await shoot(page, OUT_APP, "09-profile");

  await page.close();
} catch (e) {
  console.error("Walkthrough error:", e);
  process.exitCode = 1;
} finally {
  await browser.close();
  await client.end();
  console.log("\nDone.");
}
