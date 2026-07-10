import type { PageDef } from "./types";

export const faqsDefaults = {
  hero: {
    title: "Frequently Asked Questions",
    subtitle: "Find answers to common questions about Iṣéyá",
  },
  search: {
    placeholder: "Search FAQs...",
  },
  faqs: {
    items: [
      {
        category: "General",
        question: "What is Iṣéyá?",
        answer: "Iṣéyá is a job marketplace platform by Renowned Technology Limited, connecting workers with employers in Nigeria. Whether you're looking for casual gigs, part-time roles, remote work, freelance projects, or full-time positions, Iṣéyá makes the connection easy and secure.",
      },
      {
        category: "General",
        question: "Is Iṣéyá free to use?",
        answer: "For job seekers, Iṣéyá is completely free — browse jobs, apply, and track your applications at no cost. Employers can post jobs on the free plan with limited slots, and can upgrade to Standard, Premium, or Enterprise plans for more job postings, interview credits, and advanced features. Pricing is set by the admin and may include promotional discounts.",
      },
      {
        category: "General",
        question: "What age do I need to be to use Iṣéyá?",
        answer: "You must be at least 18 years old to create an account and use Iṣéyá. This is to ensure compliance with Nigerian labor laws and protect young workers.",
      },
      {
        category: "General",
        question: "What types of jobs are available on Iṣéyá?",
        answer: "Iṣéyá covers a wide range of job types: Full-time, Part-time, Contract, Remote, and Freelance. Jobs are organized into sectors like Hospitality & Food Service, Technology & IT, Healthcare & Medicine, Construction & Labour, Domestic & Household, Marketing & Creative, Administration & Finance, and many more — all sorted alphabetically for easy browsing.",
      },
      {
        category: "General",
        question: "What currency does Iṣéyá use?",
        answer: "All salaries, subscription fees, and transactions on Iṣéyá are in Nigerian Naira (₦ / NGN).",
      },
      {
        category: "Job Seekers",
        question: "How do I apply for a job?",
        answer: "Once you've created an account and completed your profile, browse available jobs and click 'Apply' on any listing. Employers will be notified of your application and can review your profile, CV, and work history.",
      },
      {
        category: "Job Seekers",
        question: "How will I know if my application was accepted?",
        answer: "Track all your applications in your dashboard. When an employer reviews your application, the status updates to 'Shortlisted', 'Interview', 'Offered', or 'Rejected'. You'll also receive in-app notifications and email updates for important changes.",
      },
      {
        category: "Job Seekers",
        question: "What is applicant verification?",
        answer: "Verification lets you prove your identity by uploading a government-issued ID (NIN, Voter's Card, Driver's License, or International Passport) and a selfie holding the ID. After paying the verification fee, our team reviews your documents. Verified applicants get a badge on their profile, priority listing, and are 3x more likely to get hired. Verification is valid for 30 days.",
      },
      {
        category: "Job Seekers",
        question: "Can I set my preferred job types and categories?",
        answer: "Yes! In your profile settings, you can select your preferred job types (Full-time, Part-time, Contract, Remote, Freelance) and preferred job categories. We'll send you alerts when matching jobs are posted.",
      },
      {
        category: "Job Seekers",
        question: "What does the Rating on my profile mean?",
        answer: "Your profile rating is based on assessments from the Iṣéyá team after completed interviews. It reflects your performance and reliability as rated by our admin team, helping employers make informed hiring decisions.",
      },
      {
        category: "Job Seekers",
        question: "Can I submit a counter-offer to an employer?",
        answer: "Yes. When an employer sends you a job offer, you can accept it, decline it, or submit a counter-offer with your preferred salary. The employer can then accept or decline your counter-offer.",
      },
      {
        category: "Job-Aid",
        question: "What is Job-Aid?",
        answer: "Job-Aid is a paid support service for job seekers that gives your job search a professional edge. Instead of searching alone, you get hands-on help — personalized job recommendations, direct referrals to employers, AI-powered CV refining, interview booking, a verified badge, and priority support. Choose a Job-Aid plan to unlock these benefits.",
      },
      {
        category: "Job-Aid",
        question: "Who is Job-Aid for?",
        answer: "Job-Aid is designed for applicants (job seekers). It's completely optional — browsing and applying for jobs on Iṣéyá is always free. Job-Aid is for those who want extra, personalized help to land a job faster.",
      },
      {
        category: "Job-Aid",
        question: "What Job-Aid plans are available?",
        answer: "Job-Aid offers several plans tailored to different needs — Casual, Smart, Remote, Freelance, and Corporate. Each plan bundles a different set of benefits and usage limits. You can compare all plans and what they include on the Job-Aid page. Pricing is set by the platform and shown in Nigerian Naira (₦), and may include promotional discounts.",
      },
      {
        category: "Job-Aid",
        question: "What benefits are included in Job-Aid?",
        answer: "Depending on your plan, Job-Aid can include: Personalized Recommendations (matching jobs based on your preferred sectors), Referrals (our team refers you directly to matching employers), CV Refining (polish your CV instantly with our AI refiner or with help from our team), Interview Booking (we schedule the interviews your plan covers), a Verified Badge, and Priority Support. Not every plan includes every benefit — check the plan details before subscribing.",
      },
      {
        category: "Job-Aid",
        question: "How do I subscribe to a Job-Aid plan?",
        answer: "Go to the Job-Aid page, compare the plans, and choose the one that fits your needs. Payments are made in Nigerian Naira (₦) via Paystack or Flutterwave, which support cards, bank transfers, USSD, and mobile money. Once your payment is confirmed, your plan activates and your benefits unlock immediately.",
      },
      {
        category: "Job-Aid",
        question: "How do I use my Job-Aid benefits after subscribing?",
        answer: "Once your plan is active, manage everything from the 'My Job-Aid' hub in your dashboard. Some benefits are self-serve — you can view recommendations, refine your CV, or start verification yourself. Others, like referrals and interview booking, are handled directly by our team on your behalf. Your hub also shows your usage and any remaining limits for each benefit.",
      },
      {
        category: "Job-Aid",
        question: "Do Job-Aid benefits have usage limits?",
        answer: "Some benefits — like recommendations, referrals, and interview booking — come with a set number of uses based on your plan, while others (such as CV refining, verification, and priority support) are simply available while your plan is active. Your 'My Job-Aid' hub shows your current usage and remaining limits for each benefit.",
      },
      {
        category: "Job-Aid",
        question: "How is Job-Aid different from employer subscriptions?",
        answer: "Employer subscription plans (Basic, Standard, Premium, Enterprise) are for businesses posting and managing jobs. Job-Aid plans (Casual, Smart, Remote, Freelance, Corporate) are for job seekers who want extra help finding and landing work. They're completely separate — Job-Aid is only for applicants.",
      },
      {
        category: "Job-Aid",
        question: "Does Job-Aid guarantee me a job?",
        answer: "No. Job-Aid significantly boosts your chances by giving you personalized recommendations, referrals, a polished CV, interview support, and a verified badge — but final hiring decisions are always made by employers. Job-Aid helps you stand out and get in front of the right employers faster.",
      },
      {
        category: "Employers",
        question: "How do I post a job?",
        answer: "After creating an employer account, click 'Post a Job' on your dashboard. Fill in the job details including title, category (from organized sectors), job type (Full-time, Part-time, Contract, Remote, or Freelance), location (state, LGA, city/town, and specific address), salary range, and requirements. Your job goes live instantly.",
      },
      {
        category: "Employers",
        question: "What subscription plans are available?",
        answer: "Iṣéyá offers four tiers: Basic (Free) for getting started with limited job postings; Standard for growing businesses with more job slots and applicant management; Premium (most popular) with priority listing, verified badge, interview credits, and Facebook auto-posting; and Enterprise for large-scale recruitment with unlimited postings and dedicated support. Pricing and job limits are configured by the platform and may include discounts.",
      },
      {
        category: "Employers",
        question: "How do I pay for subscriptions?",
        answer: "Subscriptions can be paid via Paystack or Flutterwave — both support cards, bank transfers, USSD, and mobile money. All payments are in Nigerian Naira (₦).",
      },
      {
        category: "Employers",
        question: "What are Iṣéyá Recommendations?",
        answer: "Available on Premium and Enterprise plans, Iṣéyá Recommendations are admin-scored applicant assessments. Our team interviews applicants and provides ratings and notes to help you make better hiring decisions.",
      },
      {
        category: "Employers",
        question: "How do I pay workers?",
        answer: "Payment is arranged directly between employers and workers. Iṣéyá facilitates the connection but does not handle payments between parties. We recommend agreeing on payment terms before work begins.",
      },
      {
        category: "Agents",
        question: "What is an Agent account?",
        answer: "An Agent account lets you act as a recruitment middleman on Iṣéyá. You post jobs on behalf of employers or clients, manage applications, review candidates, send offers, and handle the entire hiring process — just like an employer would. It's perfect for recruitment agencies, HR consultants, staffing firms, or anyone who wants to earn money by connecting employers with workers.",
      },
      {
        category: "Agents",
        question: "How do Agents earn money?",
        answer: "Agents earn money directly by charging their clients (employers) for recruitment services. You set your own rates and terms with each client. Iṣéyá gives you the tools to post jobs, screen applicants, and manage the hiring process — you keep the fees you negotiate with your clients. The more placements you make, the more you earn.",
      },
      {
        category: "Agents",
        question: "What can Agents do on the platform?",
        answer: "Agents have the same core functions as employers. You can post jobs across all categories (corporate, remote, freelance, casual, industrial), review and manage applications, schedule interviews, send job offers, handle counter-offers, and track all your postings from your dashboard. The key difference is that you're doing it on behalf of multiple clients rather than a single company.",
      },
      {
        category: "Agents",
        question: "How do Agent job posting credits work?",
        answer: "Agents can post jobs using a credit-based system or through a subscription plan. Each credit allows you to post one job listing. You can purchase credits as needed, or subscribe to a plan that includes a set number of job posts per month. Your dashboard shows your remaining credits and active postings at all times.",
      },
      {
        category: "Agents",
        question: "Can Agents manage jobs for multiple employers?",
        answer: "Yes, that's exactly what Agents are designed for. You can post and manage jobs for as many employers or clients as you want. Each job listing can specify the hiring company's details, and you manage the full recruitment pipeline for all of them from a single Agent dashboard.",
      },
      {
        category: "Agents",
        question: "How do I become an Agent?",
        answer: "Simply register on Iṣéyá and select 'Agent' as your role during the onboarding process. Complete your profile with your business details and you're ready to start posting jobs. There's no approval process — you can begin immediately after registration.",
      },
      {
        category: "Account & Security",
        question: "How do I create an account?",
        answer: "You can register with your email address and password, or sign in with Google. During registration, you'll select your role (applicant, employer, or agent) and complete a short onboarding process to set up your profile.",
      },
      {
        category: "Account & Security",
        question: "How do I reset my password?",
        answer: "Click 'Forgot Password' on the login page and enter your email address. You'll receive a password reset link via email. Follow the link to set a new password. The reset link expires after a limited time for security.",
      },
      {
        category: "Account & Security",
        question: "Is my personal information safe?",
        answer: "Yes, we take data security seriously. Passwords are hashed with bcrypt, sessions are stored securely in PostgreSQL, and login forms are protected with CAPTCHA. We comply with the Nigeria Data Protection Regulation (NDPR). Read our Privacy Policy for full details.",
      },
      {
        category: "Account & Security",
        question: "How do I delete my account?",
        answer: "To delete your account, submit a support ticket through the Contact page or from your dashboard. Our team will process your request and remove your data in accordance with our privacy policy.",
      },
      {
        category: "Support",
        question: "How do I contact support?",
        answer: "You can submit a support ticket from your dashboard or use the Contact page. Our team responds to tickets with a conversation thread so you can track your issue. You can also reach us via email at support@iseya.ng.",
      },
      {
        category: "Support",
        question: "Can I report a job or user?",
        answer: "Yes. If you encounter a suspicious job listing or user, you can report them directly from the platform. Our admin team reviews all reports and takes appropriate action.",
      },
    ],
  },
  empty: {
    message: "No FAQs found matching your search.",
  },
  contact: {
    heading: "Still have questions?",
    body: "Can't find what you're looking for? Our support team is here to help.",
    button: "Contact Support",
  },
};

export const faqsPage: PageDef = {
  key: "page_faqs",
  label: "FAQs Page",
  description: "The Frequently Asked Questions page. Manage the title, search bar, the full list of questions and answers, and the contact call-to-action.",
  defaults: faqsDefaults,
  sections: [
    {
      key: "hero",
      label: "Header Section",
      fields: [
        { key: "title", label: "Title", type: "text" },
        { key: "subtitle", label: "Subtitle", type: "text" },
      ],
    },
    {
      key: "search",
      label: "Search Bar",
      fields: [
        { key: "placeholder", label: "Search placeholder", type: "text" },
      ],
    },
    {
      key: "faqs",
      label: "Questions & Answers",
      description: "The full list of FAQs. Each item has a category, question, and answer. Questions are grouped by category in the order they appear here.",
      fields: [
        {
          key: "items",
          label: "FAQ Items",
          type: "list",
          itemLabel: "FAQ",
          itemFields: [
            { key: "category", label: "Category", type: "text" },
            { key: "question", label: "Question", type: "text" },
            { key: "answer", label: "Answer", type: "textarea" },
          ],
          itemDefaults: { category: "General", question: "", answer: "" },
        },
      ],
    },
    {
      key: "empty",
      label: "Empty Search State",
      fields: [
        { key: "message", label: "No results message", type: "text" },
      ],
    },
    {
      key: "contact",
      label: "Contact CTA Section",
      fields: [
        { key: "heading", label: "Heading", type: "text" },
        { key: "body", label: "Body", type: "textarea" },
        { key: "button", label: "Button label", type: "text" },
      ],
    },
  ],
};
