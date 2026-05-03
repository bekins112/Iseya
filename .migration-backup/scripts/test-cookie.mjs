import pg from "pg";
import crypto from "crypto";
import sign from "cookie-signature";

const SECRET = process.env.SESSION_SECRET;
const c = new pg.Client({ connectionString: process.env.DATABASE_URL });
await c.connect();
const u = (await c.query("SELECT * FROM users WHERE id=$1", ["8f6d76a0-fcf7-44ff-be02-92e9b9cd9726"])).rows[0];
console.log("user:", u.email, u.role);
const user = { ...u, firstName: u.first_name, lastName: u.last_name, profileImageUrl: u.profile_image_url, isVerified: u.is_verified, companyName: u.company_name, emailVerified: u.email_verified };
const sid = crypto.randomBytes(24).toString("hex");
const expire = new Date(Date.now() + 7*24*60*60*1000);
const sess = { cookie: { originalMaxAge: 7*24*60*60*1000, expires: expire.toISOString(), httpOnly: true, path: "/", sameSite: "lax", secure: false }, passport: { user } };
await c.query("INSERT INTO sessions (sid,sess,expire) VALUES ($1,$2,$3) ON CONFLICT (sid) DO UPDATE SET sess=EXCLUDED.sess, expire=EXCLUDED.expire", [sid, sess, expire]);
const signed = "s:" + sign.sign(sid, SECRET);
console.log("sid:", sid);
console.log("signed:", signed);
console.log("urlencoded:", encodeURIComponent(signed));
await c.end();
