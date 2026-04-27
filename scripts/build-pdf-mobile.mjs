import PDFDocument from "pdfkit";
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const OUT = "attached_assets/walkthrough/output/Iseya-Walkthrough-Guide-Mobile.pdf";
fs.mkdirSync(path.dirname(OUT), { recursive: true });

const ORANGE = "#F59E0B";
const DARK = "#1F2937";
const GRAY = "#6B7280";
const LIGHT = "#FEF3C7";

const employerSteps = [
  { img: "01-landing.png", title: "1. Open the Iṣéyá app",
    desc: "Launch the Iṣéyá web app or PWA on your phone and tap Get Started or Sign Up." },
  { img: "02-for-employers.png", title: "2. Tap For Employers",
    desc: "Open the For Employers page from the menu to see the benefits of hiring on Iṣéyá." },
  { img: "03-register.png", title: "3. Create your employer account",
    desc: "Enter your details and choose the Employer role to unlock job posting on mobile." },
  { img: "04-dashboard.png", title: "4. Land on your dashboard",
    desc: "See active jobs, recent applications and quick actions — all optimised for one-handed use." },
  { img: "05-manage-jobs.png", title: "5. Open Manage Jobs",
    desc: "Use the bottom navigation to view, edit or close every job you have posted." },
  { img: "06-post-job-empty.png", title: "6. Tap Post in the bottom nav",
    desc: "The Post button opens the new job form with all the fields you need to attract great applicants." },
  { img: "07-post-job-filled.png", title: "7. Fill in your job details",
    desc: "Add a title, category, salary range, location, deadline and a clear description, then publish." },
  { img: "08-applicants-inbox.png", title: "8. Review your applicants",
    desc: "Tap Jobs in the bottom nav to see who applied to each role and review their profiles." },
  { img: "09-profile.png", title: "9. Manage your company profile",
    desc: "Open Profile from the More menu to update your company name, logo and contact information." },
];

const applicantSteps = [
  { img: "01-landing.png", title: "1. Open the Iṣéyá app",
    desc: "Launch Iṣéyá on your phone and tap Browse Jobs or Get Started to begin." },
  { img: "02-for-applicants.png", title: "2. Visit the For Job Seekers page",
    desc: "See how Iṣéyá helps you find verified casual jobs near you, with priority for verified profiles." },
  { img: "03-register.png", title: "3. Sign up as an applicant",
    desc: "Create a free account, choose the Applicant role and verify your email." },
  { img: "04-dashboard.png", title: "4. View your applicant dashboard",
    desc: "See recommended jobs, your application status and notifications all on one screen." },
  { img: "05-browse-jobs.png", title: "5. Browse jobs near you",
    desc: "Filter by category, location, salary or job type to find roles that match your skills." },
  { img: "06-job-detail.png", title: "6. Tap a job to read the details",
    desc: "Review the description, salary range and employer, then tap the big Apply Now button." },
  { img: "07-apply-modal.png", title: "7. Submit your application",
    desc: "Write a short message to the employer, attach your CV if needed and send your application." },
  { img: "08-my-applications.png", title: "8. Track your applications",
    desc: "Open My Applications to see the status of every job you applied for and respond to offers." },
];

const PAGE_W = 595, PAGE_H = 842; // A4 portrait
const doc = new PDFDocument({ size: "A4", margin: 40, autoFirstPage: false, info: {
  Title: "Iṣéyá Mobile Walkthrough Guide",
  Author: "Iṣéyá",
  Subject: "Mobile employer post-job and applicant apply walkthrough",
}});
doc.pipe(fs.createWriteStream(OUT));

function coverPage() {
  doc.addPage();
  doc.rect(0, 0, doc.page.width, 240).fill(ORANGE);
  doc.fillColor("#FFFFFF").fontSize(54).font("Helvetica-Bold").text("Iṣéyá", 40, 80);
  doc.fontSize(22).font("Helvetica").text("Mobile Walkthrough Guide", 40, 152);
  doc.fontSize(13).text("Post a job and apply on your phone", 40, 188);
  doc.moveDown(8);
  doc.fillColor(DARK).fontSize(14).font("Helvetica").text("This step-by-step guide shows you:", 40, 290);
  doc.moveDown(0.6);
  doc.fontSize(13).fillColor(DARK)
     .text("• How an employer creates an account and posts a job from their phone", { indent: 20 })
     .text("• How an applicant signs up, finds a job and applies on mobile", { indent: 20 });
  doc.moveDown(1.2);
  doc.fontSize(11).fillColor(GRAY)
     .text("Every screen below was captured on a real mobile viewport (390 × 844, 2× DPR), so what you see here is exactly what your users see on their phones.", 40, undefined, { width: doc.page.width - 80 });
  doc.moveDown(2);
  doc.fillColor(ORANGE).fontSize(11).font("Helvetica-Bold").text("Connecting Nigerian workers with opportunities.", 40);
}

function sectionTitle(t, subtitle) {
  doc.addPage();
  doc.rect(0, 0, doc.page.width, 100).fill(LIGHT);
  doc.fillColor(DARK).fontSize(28).font("Helvetica-Bold").text(t, 40, 32);
  doc.fillColor(GRAY).fontSize(12).font("Helvetica").text(subtitle, 40, 72);
}

async function stepPage(folder, step) {
  doc.addPage();
  doc.rect(0, 0, doc.page.width, 6).fill(ORANGE);

  // Left side: title + description (explicit y, height to prevent overflow autopagination)
  const textX = 40;
  const textW = 230;
  doc.fillColor(DARK).fontSize(17).font("Helvetica-Bold")
    .text(step.title, textX, 50, { width: textW, height: 80, ellipsis: true });
  doc.fillColor(GRAY).fontSize(11.5).font("Helvetica")
    .text(step.desc, textX, 140, { width: textW, height: 200 });

  // Right side: phone-style mobile screenshot
  const imgPath = path.join("attached_assets/walkthrough", folder, step.img);
  if (fs.existsSync(imgPath)) {
    const meta = await sharp(imgPath).metadata();
    // Frame dimensions (centered on right portion of page)
    const maxH = PAGE_H - 200;
    const maxW = PAGE_W - textW - 100;
    let w, h;
    if (meta.width / meta.height > maxW / maxH) {
      w = maxW; h = Math.round(maxW * meta.height / meta.width);
    } else {
      h = maxH; w = Math.round(maxH * meta.width / meta.height);
    }
    const x = textX + textW + 30;
    const y = 80;
    // phone shell
    const padX = 8, padY = 14;
    doc.save();
    doc.roundedRect(x - padX, y - padY, w + padX*2, h + padY*2, 24).fillAndStroke("#1F2937", "#1F2937");
    doc.restore();
    doc.image(imgPath, x, y, { fit: [w, h] });
  }

  doc.fillColor(GRAY).fontSize(9)
    .text("Iṣéyá Mobile Walkthrough", 40, doc.page.height - 55, { lineBreak: false });
  doc.text(folder === "mobile-employer" ? "Employer flow" : "Applicant flow",
    doc.page.width - 140, doc.page.height - 55, { width: 100, align: "right", lineBreak: false });
}

coverPage();
sectionTitle("Part 1 — Employer flow", "Post your first job from your phone in 9 simple steps");
for (const s of employerSteps) await stepPage("mobile-employer", s);
sectionTitle("Part 2 — Applicant flow", "Find a job and apply on your phone in 8 simple steps");
for (const s of applicantSteps) await stepPage("mobile-applicant", s);

doc.end();
console.log("PDF written to", OUT);
