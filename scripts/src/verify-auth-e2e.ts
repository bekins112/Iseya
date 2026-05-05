import { Pool } from "pg";

const BASE = process.env.AUTH_TEST_BASE_URL ?? "http://localhost:80";
const ADMIN_EMAIL = process.env.AUTH_TEST_ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.AUTH_TEST_ADMIN_PASSWORD;

type Cookies = Record<string, string>;

function parseSetCookie(jar: Cookies, header: string | null) {
  if (!header) return;
  for (const part of header.split(/,(?=[^ ;]+=)/)) {
    const [kv] = part.split(";");
    const eq = kv.indexOf("=");
    if (eq > 0) jar[kv.slice(0, eq).trim()] = kv.slice(eq + 1).trim();
  }
}

function cookieHeader(jar: Cookies): string {
  return Object.entries(jar)
    .map(([k, v]) => `${k}=${v}`)
    .join("; ");
}

async function call(
  jar: Cookies,
  method: string,
  path: string,
  body?: unknown,
): Promise<{ status: number; text: string }> {
  const headers: Record<string, string> = {};
  if (body !== undefined) headers["Content-Type"] = "application/json";
  const cookie = cookieHeader(jar);
  if (cookie) headers["Cookie"] = cookie;
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
    redirect: "manual",
  });
  parseSetCookie(jar, res.headers.get("set-cookie"));
  const text = await res.text();
  return { status: res.status, text };
}

function extractSid(jar: Cookies): string | null {
  const raw = jar["connect.sid"];
  if (!raw) return null;
  // express-session cookie format: s:<sid>.<signature>, URL-encoded.
  const decoded = decodeURIComponent(raw);
  const stripped = decoded.startsWith("s:") ? decoded.slice(2) : decoded;
  const dot = stripped.indexOf(".");
  return dot > 0 ? stripped.slice(0, dot) : stripped;
}

async function readCaptchaForSid(sid: string): Promise<string> {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL not set");
  const pool = new Pool({ connectionString: url });
  try {
    const { rows } = await pool.query<{ captcha: string | null }>(
      `SELECT sess->>'captchaText' AS captcha FROM sessions WHERE sid = $1`,
      [sid],
    );
    const captcha = rows[0]?.captcha;
    if (!captcha) throw new Error(`no captcha in session ${sid}`);
    return captcha;
  } finally {
    await pool.end();
  }
}

interface Check {
  name: string;
  ok: boolean;
  detail: string;
}

const results: Check[] = [];
function record(name: string, ok: boolean, detail: string) {
  results.push({ name, ok, detail });
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}  ${detail}`);
}

async function run() {
  // 1. Captcha endpoint
  {
    const jar: Cookies = {};
    const r = await call(jar, "GET", "/api/auth/captcha");
    record(
      "GET /api/auth/captcha",
      r.status === 200 && r.text.startsWith("<svg"),
      `status=${r.status}`,
    );
  }

  // 2. Register a fresh applicant
  const email = `verify_${Date.now()}@example.com`;
  const password = "Test1234!";
  const userJar: Cookies = {};
  {
    const r = await call(userJar, "POST", "/api/auth/register", {
      email,
      password,
      firstName: "Verify",
      lastName: "User",
      role: "applicant",
    });
    record(
      "POST /api/auth/register",
      r.status === 201 && r.text.includes(email),
      `status=${r.status}`,
    );
  }

  // 3. Authenticated /api/auth/user after register
  {
    const r = await call(userJar, "GET", "/api/auth/user");
    record(
      "GET /api/auth/user (post-register)",
      r.status === 200 && r.text.includes(email),
      `status=${r.status}`,
    );
  }

  // 4. Logout, then login with captcha
  await call(userJar, "POST", "/api/auth/logout");
  await call(userJar, "GET", "/api/auth/captcha");
  const userSid = extractSid(userJar);
  if (!userSid) throw new Error("no session id after captcha");
  const captcha = await readCaptchaForSid(userSid);
  {
    const r = await call(userJar, "POST", "/api/auth/login", {
      email,
      password,
      captcha,
    });
    record(
      "POST /api/auth/login (with captcha)",
      r.status === 200 && r.text.includes(email),
      `status=${r.status}`,
    );
  }

  // 5. Authenticated user-only endpoints
  for (const path of ["/api/jobs", "/api/my-applications", "/api/notifications"]) {
    const r = await call(userJar, "GET", path);
    record(`GET ${path}`, r.status === 200, `status=${r.status}`);
  }

  // 6. Forgot-password (always returns 200 to avoid enumeration)
  {
    const r = await call({}, "POST", "/api/auth/forgot-password", { email });
    record(
      "POST /api/auth/forgot-password",
      r.status === 200,
      `status=${r.status}`,
    );
  }

  // 7. Google OAuth start endpoint redirects to accounts.google.com
  {
    const r = await fetch(`${BASE}/api/auth/google`, { redirect: "manual" });
    const loc = r.headers.get("location") ?? "";
    record(
      "GET /api/auth/google",
      r.status === 302 && loc.includes("accounts.google.com"),
      `status=${r.status} location=${loc.slice(0, 80)}`,
    );
  }

  // 8. Admin login + admin endpoints (skipped if env vars not set)
  if (ADMIN_EMAIL && ADMIN_PASSWORD) {
    const adminJar: Cookies = {};
    await call(adminJar, "GET", "/api/auth/captcha");
    const adminSid = extractSid(adminJar);
    if (!adminSid) throw new Error("no admin session id after captcha");
    const adminCaptcha = await readCaptchaForSid(adminSid);
    {
      const r = await call(adminJar, "POST", "/api/auth/login", {
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
        captcha: adminCaptcha,
      });
      record(
        "POST /api/auth/login (admin)",
        r.status === 200 && r.text.includes(`"role":"admin"`),
        `status=${r.status}`,
      );
    }
    for (const path of [
      "/api/admin/users",
      "/api/admin/jobs",
      "/api/admin/applications",
    ]) {
      const r = await call(adminJar, "GET", path);
      record(`GET ${path}`, r.status === 200, `status=${r.status}`);
    }
  } else {
    console.log(
      "SKIP  admin checks: set AUTH_TEST_ADMIN_EMAIL and AUTH_TEST_ADMIN_PASSWORD to enable",
    );
  }

  const failed = results.filter((r) => !r.ok);
  console.log(`\n${results.length - failed.length}/${results.length} checks passed`);
  if (failed.length) {
    process.exitCode = 1;
  }
}

run().catch((err) => {
  console.error("verify-auth-e2e crashed:", err);
  process.exit(2);
});
