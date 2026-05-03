import PDFDocument from "pdfkit";
import fs from "node:fs";
import path from "node:path";

const OUT = "attached_assets/walkthrough/output/Iseya-Walkthrough-Guide.pdf";
fs.mkdirSync(path.dirname(OUT), { recursive: true });

const ORANGE = "#F59E0B";
const DARK = "#1F2937";
const GRAY = "#6B7280";
const LIGHT = "#FEF3C7";

const employerSteps = [
  { img: "01-landing.png", title: "1. Land on the Iṣéyá homepage",
    desc: "Visit iseya.ng and tap the Hire / Get Started button to begin posting your first job." },
  { img: "02-for-employers.png", title: "2. Explore the employer landing page",
    desc: "Review what Iṣéyá offers employers — verified workers, fast hiring, flexible plans." },
  { img: "03-register.png", title: "3. Create your employer account",
    desc: "Sign up with your name, email, password and choose the Employer role to unlock job posting." },
  { img: "04-dashboard.png", title: "4. Arrive on your employer dashboard",
    desc: "See active jobs, applications, and quick actions. Use the sidebar to navigate the platform." },
  { img: "05-manage-jobs.png", title: "5. Open Manage Jobs",
    desc: "View all jobs you have posted, edit them, change their status, or post a new one." },
  { img: "06-post-job-empty.png", title: "6. Open the Post a Job form",
    desc: "Tap Post a Job in the sidebar to open the new job posting form." },
  { img: "07-post-job-filled.png", title: "7. Fill in the job details",
    desc: "Add a title, category, salary range, location, deadline and a clear description, then publish." },
  { img: "08-applicants-inbox.png", title: "8. Review incoming applicants",
    desc: "Open Manage Jobs to see applicants for each role and review their profiles and messages." },
  { img: "09-profile.png", title: "9. Keep your company profile up to date",
    desc: "Update your company name, logo, address and category from your Profile page to build trust." },
];

const applicantSteps = [
  { img: "01-landing.png", title: "1. Land on the Iṣéyá homepage",
    desc: "Visit iseya.ng and tap Find Work or Browse Jobs to start your job search." },
  { img: "02-for-applicants.png", title: "2. Explore the For Job Seekers page",
    desc: "See how Iṣéyá helps you find verified casual jobs in your area, with priority for verified profiles." },
  { img: "03-register.png", title: "3. Sign up as an applicant",
    desc: "Create a free account with your name, email, password and choose the Applicant role." },
  { img: "04-dashboard.png", title: "4. View your applicant dashboard",
    desc: "Track your applications, recommended jobs and notifications from one place." },
  { img: "05-browse-jobs.png", title: "5. Browse available jobs",
    desc: "Filter by category, location, salary range or job type to find roles that match your skills." },
  { img: "06-job-detail.png", title: "6. Open a job to read the full details",
    desc: "Review the description, salary, location and employer, then tap Apply Now to start your application." },
  { img: "07-apply-modal.png", title: "7. Submit your application",
    desc: "Write a short message to the employer, attach your CV if needed, then send your application." },
  { img: "08-my-applications.png", title: "8. Track your applications",
    desc: "Open My Applications to see the status of every job you applied for and respond to offers." },
];

const doc = new PDFDocument({ size: "A4", margin: 40, autoFirstPage: false, info: {
  Title: "Iṣéyá Walkthrough Guide",
  Author: "Iṣéyá",
  Subject: "Employer post-job and Applicant apply walkthrough",
}});
doc.pipe(fs.createWriteStream(OUT));

function coverPage() {
  doc.addPage();
  doc.rect(0, 0, doc.page.width, 220).fill(ORANGE);
  doc.fillColor("#FFFFFF").fontSize(48).font("Helvetica-Bold").text("Iṣéyá", 40, 80);
  doc.fontSize(20).font("Helvetica").text("Walkthrough Guide", 40, 140);
  doc.fontSize(12).text("Employer post-job and applicant apply flows", 40, 170);
  doc.moveDown(8);
  doc.fillColor(DARK).fontSize(14).font("Helvetica").text("This guide walks you step by step through:", 40, 260);
  doc.moveDown(0.6);
  doc.fontSize(13).fillColor(DARK)
     .text("• How an employer creates an account and posts a new job", { indent: 20 })
     .text("• How an applicant signs up, finds a job and submits an application", { indent: 20 });
  doc.moveDown(1);
  doc.fontSize(11).fillColor(GRAY)
     .text("Each step shows the exact screen you will see in the Iṣéyá web app, with a short explanation of what to do next.", 40);
  doc.moveDown(2);
  doc.fillColor(ORANGE).fontSize(11).font("Helvetica-Bold").text("Connecting Nigerian workers with opportunities.", 40);
}

function sectionTitle(t, subtitle) {
  doc.addPage();
  doc.rect(0, 0, doc.page.width, 90).fill(LIGHT);
  doc.fillColor(DARK).fontSize(26).font("Helvetica-Bold").text(t, 40, 28);
  doc.fillColor(GRAY).fontSize(12).font("Helvetica").text(subtitle, 40, 64);
}

function stepPage(folder, step) {
  doc.addPage();
  // header bar
  doc.rect(0, 0, doc.page.width, 6).fill(ORANGE);
  // title
  doc.fillColor(DARK).fontSize(18).font("Helvetica-Bold").text(step.title, 40, 30);
  // description
  doc.fillColor(GRAY).fontSize(11.5).font("Helvetica").text(step.desc, 40, 60, { width: doc.page.width - 80 });
  // image with frame
  const imgPath = path.join("attached_assets/walkthrough", folder, step.img);
  if (fs.existsSync(imgPath)) {
    const maxW = doc.page.width - 80;
    const imgY = 110;
    const maxH = doc.page.height - imgY - 60;
    doc.save();
    doc.roundedRect(40, imgY, maxW, maxH, 6).strokeColor("#E5E7EB").lineWidth(1).stroke();
    doc.image(imgPath, 44, imgY + 4, { fit: [maxW - 8, maxH - 8], align: "center", valign: "top" });
    doc.restore();
  }
  // footer
  doc.fillColor(GRAY).fontSize(9).text("Iṣéyá Walkthrough Guide", 40, doc.page.height - 30);
  doc.text(folder === "employer" ? "Employer flow" : "Applicant flow", 0, doc.page.height - 30, { align: "right", width: doc.page.width - 40 });
}

coverPage();
sectionTitle("Part 1 — Employer flow", "How to create an account and post your first job on Iṣéyá");
employerSteps.forEach(s => stepPage("employer", s));
sectionTitle("Part 2 — Applicant flow", "How to find a job and submit an application on Iṣéyá");
applicantSteps.forEach(s => stepPage("applicant", s));

doc.end();
console.log("PDF written to", OUT);
