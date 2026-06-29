import type { PageDef } from "./types";

export const termsDefaults = {
  header: {
    title: "Terms of Use",
    intro: "Please read these terms carefully before using the Iseya platform.",
    lastUpdated: "Last updated: March 2026",
  },
  sections: {
    items: [
      {
        title: "1. Acceptance of Terms",
        content:
          "By accessing or using the Iṣéyá platform (\"Platform\"), operated by Renowned Technology Limited, you agree to be bound by these Terms of Use. If you do not agree to these terms, please do not use the Platform. Your continued use of the Platform constitutes your acceptance of any updates or modifications to these terms.",
      },
      {
        title: "2. Eligibility",
        content:
          "You must be at least 18 years of age to create an account and use the Platform. By registering, you confirm that you meet this age requirement. Iṣéyá reserves the right to request proof of age and to suspend or terminate accounts that violate this requirement.",
      },
      {
        title: "3. Account Registration & Security",
        content:
          "You are responsible for maintaining the confidentiality of your account credentials. You agree to provide accurate, current, and complete information during registration. You must not share your account with others or allow unauthorized access. You are responsible for all activities that occur under your account. Notify us immediately if you suspect any unauthorized use of your account.",
      },
      {
        title: "4. Platform Use",
        content:
          "Iṣéyá is a marketplace connecting job seekers (applicants) with employers for casual and short-term work opportunities. The Platform facilitates connections but does not act as an employer, staffing agency, or employment intermediary. Users may register as applicants (job seekers) or employers (job posters). Each role has specific features and limitations as described on the Platform.",
      },
      {
        title: "5. User Conduct",
        content:
          "Users agree not to: (a) post false, misleading, or fraudulent information; (b) harass, abuse, or discriminate against other users; (c) use the Platform for any illegal purpose; (d) attempt to gain unauthorized access to other accounts or Platform systems; (e) scrape, collect, or harvest user data; (f) post spam or unsolicited advertisements; (g) impersonate any person or entity; (h) interfere with or disrupt the Platform's operation.",
      },
      {
        title: "6. Job Listings & Applications",
        content:
          "Employers are responsible for the accuracy of their job listings, including job descriptions, compensation, location, and requirements. Applicants are responsible for the accuracy of their profiles and application materials. Iṣéyá does not guarantee the legitimacy of any job listing or the qualifications of any applicant. Users should exercise due diligence before entering into any arrangement.",
      },
      {
        title: "7. Subscription & Payments",
        content:
          "Certain features require paid subscriptions. Subscription fees are displayed in Nigerian Naira (NGN) and processed through Paystack or Flutterwave. By subscribing, you authorize recurring charges as applicable. Subscription benefits, pricing, and limits may be updated by the Platform. Refund policies are subject to the terms displayed at the time of purchase.",
      },
      {
        title: "8. Verification Services",
        content:
          "Our optional verification service allows applicants to submit identification documents for review. Verification is valid for a limited period and does not constitute a comprehensive background check. Employers should conduct their own due diligence. Verification fees are non-refundable once the review process begins.",
      },
      {
        title: "9. Prohibited Content",
        content:
          "Users may not post content that is: (a) illegal, harmful, or threatening; (b) defamatory, vulgar, or obscene; (c) discriminatory based on race, gender, religion, nationality, disability, age, or sexual orientation; (d) infringing on intellectual property rights; (e) containing malware or malicious code. Iṣéyá reserves the right to remove any content that violates these terms without notice.",
      },
      {
        title: "10. Limitation of Liability",
        content:
          "To the maximum extent permitted by Nigerian law, Renowned Technology Limited shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of the Platform. This includes damages for loss of profits, data, goodwill, or other intangible losses. Our total liability for any claim shall not exceed the amount you paid to us in the 12 months preceding the claim.",
      },
      {
        title: "11. Account Termination",
        content:
          "Iṣéyá may suspend or terminate your account at any time for violations of these terms, fraudulent activity, or any conduct deemed harmful to the Platform or its users. You may also delete your account at any time through your profile settings. Upon termination, your right to use the Platform ceases immediately, though certain provisions of these terms survive termination.",
      },
      {
        title: "12. Governing Law & Disputes",
        content:
          "These Terms of Use shall be governed by and construed in accordance with the laws of the Federal Republic of Nigeria. Any disputes arising from these terms or your use of the Platform shall be resolved through negotiation in good faith. If negotiation fails, disputes shall be submitted to the exclusive jurisdiction of Nigerian courts.",
      },
      {
        title: "13. Changes to Terms",
        content:
          "Iṣéyá reserves the right to modify these Terms of Use at any time. Significant changes will be communicated through the Platform or via email to registered users. Your continued use of the Platform after changes are posted constitutes acceptance of the revised terms. We encourage users to review these terms periodically.",
      },
    ],
  },
  footer: {
    note: "By using Iseya, you acknowledge that you have read, understood, and agree to these Terms of Use. If you have any questions, please",
    contactLabel: "contact us",
  },
};

export const termsPage: PageDef = {
  key: "page_terms",
  label: "Terms of Use",
  description: "The Terms of Use page. Edit the title, intro, and the full list of terms sections.",
  defaults: termsDefaults,
  sections: [
    {
      key: "header",
      label: "Header",
      fields: [
        { key: "title", label: "Page title", type: "text" },
        { key: "intro", label: "Intro paragraph", type: "textarea" },
        { key: "lastUpdated", label: "Last updated line", type: "text" },
      ],
    },
    {
      key: "sections",
      label: "Terms Sections",
      fields: [
        {
          key: "items",
          label: "Sections",
          type: "list",
          itemLabel: "Section",
          itemFields: [
            { key: "title", label: "Heading", type: "text" },
            { key: "content", label: "Body", type: "textarea" },
          ],
          itemDefaults: { title: "", content: "" },
        },
      ],
    },
    {
      key: "footer",
      label: "Footer Note",
      fields: [
        { key: "note", label: "Acknowledgement note", type: "textarea" },
        { key: "contactLabel", label: "Contact link label", type: "text" },
      ],
    },
  ],
};
