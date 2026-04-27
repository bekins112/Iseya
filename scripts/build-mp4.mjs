import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const OUT_DIR = "attached_assets/walkthrough/output";
const TMP = "/tmp/walkthrough_mp4";
fs.mkdirSync(OUT_DIR, { recursive: true });
fs.rmSync(TMP, { recursive: true, force: true });
fs.mkdirSync(TMP, { recursive: true });

const W = 1920, H = 1080;

const ORANGE = { r: 245, g: 158, b: 11 };
const DARK = { r: 31, g: 41, b: 55 };

async function makeTitleSlide(out, title, subtitle, bg = "white") {
  const svg = `
  <svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
    <defs>
      <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#F59E0B"/>
        <stop offset="100%" stop-color="#FBBF24"/>
      </linearGradient>
    </defs>
    <rect width="${W}" height="${H}" fill="${bg === "orange" ? "url(#g)" : "#FFFBEB"}"/>
    ${bg !== "orange" ? `<rect x="0" y="0" width="${W}" height="14" fill="#F59E0B"/>` : ""}
    <text x="${W/2}" y="${H/2 - 60}" font-family="Helvetica, Arial, sans-serif" font-size="96" font-weight="700" fill="${bg === "orange" ? "#FFFFFF" : "#1F2937"}" text-anchor="middle">${title}</text>
    <text x="${W/2}" y="${H/2 + 40}" font-family="Helvetica, Arial, sans-serif" font-size="36" fill="${bg === "orange" ? "#FFF7ED" : "#6B7280"}" text-anchor="middle">${subtitle}</text>
  </svg>`;
  await sharp(Buffer.from(svg)).png().toFile(out);
}

async function makeStepFrame(out, srcImg, stepNum, title) {
  // canvas with shadowed centered screenshot + title bar
  const meta = await sharp(srcImg).metadata();
  const targetW = Math.min(W - 200, meta.width * 1.2);
  const targetH = Math.min(H - 240, meta.height * 1.2);
  let resizedW, resizedH;
  if (meta.width / meta.height > targetW / targetH) {
    resizedW = Math.round(targetW); resizedH = Math.round(targetW * meta.height / meta.width);
  } else {
    resizedH = Math.round(targetH); resizedW = Math.round(targetH * meta.width / meta.height);
  }
  const screenshotBuf = await sharp(srcImg).resize(resizedW, resizedH).png().toBuffer();
  const xOff = Math.round((W - resizedW) / 2);
  const yOff = Math.round((H - resizedH) / 2 + 40);

  const titleSvg = `
  <svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
    <rect width="${W}" height="${H}" fill="#FFFBEB"/>
    <rect x="0" y="0" width="${W}" height="120" fill="#F59E0B"/>
    <text x="60" y="78" font-family="Helvetica, Arial, sans-serif" font-size="44" font-weight="700" fill="#FFFFFF">Step ${stepNum}</text>
    <text x="${W/2}" y="78" font-family="Helvetica, Arial, sans-serif" font-size="44" font-weight="700" fill="#FFFFFF" text-anchor="middle">${escapeXml(title)}</text>
    <text x="${W - 60}" y="78" font-family="Helvetica, Arial, sans-serif" font-size="36" font-weight="700" fill="#FFFFFF" text-anchor="end">Iṣéyá</text>
  </svg>`;

  await sharp(Buffer.from(titleSvg))
    .composite([{ input: screenshotBuf, top: yOff, left: xOff }])
    .png()
    .toFile(out);
}

function escapeXml(s) {
  return s.replace(/[<>&'"]/g, c => ({"<":"&lt;",">":"&gt;","&":"&amp;","'":"&apos;",'"':"&quot;"}[c]));
}

const employerSteps = [
  { img: "01-landing.png", title: "Open the Iṣéyá homepage" },
  { img: "02-for-employers.png", title: "Visit the employer page" },
  { img: "03-register.png", title: "Create your employer account" },
  { img: "04-dashboard.png", title: "Land on your dashboard" },
  { img: "05-manage-jobs.png", title: "Open Manage Jobs" },
  { img: "06-post-job-empty.png", title: "Open the Post a Job form" },
  { img: "07-post-job-filled.png", title: "Fill in your job details" },
  { img: "08-applicants-inbox.png", title: "Review your applicants" },
  { img: "09-profile.png", title: "Keep your profile updated" },
];
const applicantSteps = [
  { img: "01-landing.png", title: "Open the Iṣéyá homepage" },
  { img: "02-for-applicants.png", title: "Visit the For Job Seekers page" },
  { img: "03-register.png", title: "Sign up as an applicant" },
  { img: "04-dashboard.png", title: "View your applicant dashboard" },
  { img: "05-browse-jobs.png", title: "Browse available jobs" },
  { img: "06-job-detail.png", title: "Open a job to view details" },
  { img: "07-apply-modal.png", title: "Submit your application" },
  { img: "08-my-applications.png", title: "Track your applications" },
];

const FPS = 30;
const STEP_SECS = 3.5;
const TITLE_SECS = 2.5;

const concatLines = [];
let frameIdx = 0;

async function pushFrame(srcPath, secs) {
  const dst = path.join(TMP, `f${String(frameIdx).padStart(4, "0")}.png`);
  fs.copyFileSync(srcPath, dst);
  // generate "secs" copies — easier to use ffmpeg concat with duration
  concatLines.push(`file '${dst}'`);
  concatLines.push(`duration ${secs}`);
  frameIdx++;
}

const intro = path.join(TMP, "intro.png");
await makeTitleSlide(intro, "Iṣéyá", "Walkthrough — post a job and apply", "orange");
await pushFrame(intro, TITLE_SECS);

const empTitle = path.join(TMP, "emp_title.png");
await makeTitleSlide(empTitle, "Part 1 · Employer", "Post your first job in 9 steps");
await pushFrame(empTitle, TITLE_SECS);

for (let i = 0; i < employerSteps.length; i++) {
  const s = employerSteps[i];
  const out = path.join(TMP, `emp_${i}.png`);
  await makeStepFrame(out, path.join("attached_assets/walkthrough/employer", s.img), i + 1, s.title);
  await pushFrame(out, STEP_SECS);
}

const appTitle = path.join(TMP, "app_title.png");
await makeTitleSlide(appTitle, "Part 2 · Applicant", "Find a job and apply in 8 steps");
await pushFrame(appTitle, TITLE_SECS);

for (let i = 0; i < applicantSteps.length; i++) {
  const s = applicantSteps[i];
  const out = path.join(TMP, `app_${i}.png`);
  await makeStepFrame(out, path.join("attached_assets/walkthrough/applicant", s.img), i + 1, s.title);
  await pushFrame(out, STEP_SECS);
}

const outro = path.join(TMP, "outro.png");
await makeTitleSlide(outro, "iseya.ng", "Connecting Nigerian workers with opportunities", "orange");
await pushFrame(outro, TITLE_SECS);
// concat list needs the last file repeated without duration
concatLines.push(`file '${path.join(TMP, "outro.png")}'`);

const concatFile = path.join(TMP, "concat.txt");
fs.writeFileSync(concatFile, concatLines.join("\n"));

const outMp4 = path.join(OUT_DIR, "Iseya-Walkthrough.mp4");
console.log("Encoding video to", outMp4);
execSync(`ffmpeg -y -f concat -safe 0 -i "${concatFile}" -vsync vfr -pix_fmt yuv420p -vf "scale=${W}:${H}:force_original_aspect_ratio=decrease,pad=${W}:${H}:(ow-iw)/2:(oh-ih)/2:white,fps=${FPS}" -c:v libx264 -preset medium -crf 22 "${outMp4}"`, { stdio: "inherit" });
console.log("Done:", outMp4);
