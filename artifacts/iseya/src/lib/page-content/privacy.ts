import type { PageDef } from "./types";

export const privacyDefaults = {
  header: {
    title: "Privacy Policy",
    intro:
      "Your privacy is important to us. This policy explains how we collect, use, and protect your personal data in compliance with the Nigeria Data Protection Regulation (NDPR).",
    lastUpdated: "Last updated: February 2026",
  },
  sections: {
    items: [
      {
        title: "1. Information We Collect",
        content:
          "We collect information you provide directly when registering on the Platform, including your full name, email address, phone number, location, date of birth, and professional details such as skills, qualifications, and work experience. For employers, we collect business name, industry, and company details. We also collect information automatically, including device information, IP address, browser type, usage patterns, and cookies. If you use our verification service, we collect identification documents and selfie photographs for identity confirmation purposes.",
      },
      {
        title: "2. How We Use Your Information",
        content:
          "We use your information to: (a) create and manage your account; (b) facilitate connections between job seekers and employers; (c) process subscription payments and verification requests; (d) communicate with you about your account, applications, and Platform updates; (e) improve and personalise your experience on the Platform; (f) ensure Platform security and prevent fraud; (g) comply with legal obligations under Nigerian law, including the Nigeria Data Protection Regulation (NDPR); (h) send you relevant job notifications and recommendations based on your profile and preferences.",
      },
      {
        title: "3. Data Sharing & Disclosure",
        content:
          "We may share your information with: (a) employers when you apply for a job listing (your profile, CV, and application details); (b) payment processors (Paystack and Flutterwave) to facilitate transactions; (c) service providers who assist us in operating the Platform, subject to confidentiality obligations; (d) law enforcement or regulatory authorities when required by Nigerian law or to protect our legal rights. We do not sell your personal information to third parties. Employers who receive your application data are required to use it solely for recruitment purposes.",
      },
      {
        title: "4. Data Security",
        content:
          "We implement appropriate technical and organisational measures to protect your personal data against unauthorised access, alteration, disclosure, or destruction, in accordance with the Nigeria Data Protection Regulation (NDPR). These measures include encryption of sensitive data, secure server infrastructure, access controls, and regular security assessments. However, no method of transmission over the Internet or electronic storage is 100% secure, and we cannot guarantee absolute security. You are responsible for maintaining the confidentiality of your account credentials.",
      },
      {
        title: "5. Your Rights",
        content:
          "Under the Nigeria Data Protection Regulation (NDPR) and applicable law, you have the right to: (a) access the personal data we hold about you; (b) request correction of inaccurate or incomplete data; (c) request deletion of your personal data, subject to legal retention requirements; (d) object to or restrict the processing of your data in certain circumstances; (e) withdraw consent for data processing where consent was the basis; (f) receive your data in a portable format; (g) lodge a complaint with the National Information Technology Development Agency (NITDA). To exercise these rights, contact us at privacy@iseya.com.",
      },
      {
        title: "6. Data Retention",
        content:
          "We retain your personal data for as long as your account is active or as needed to provide services to you. If you delete your account, we will remove your personal data within 30 days, except where retention is required by law or for legitimate business purposes such as resolving disputes or enforcing our agreements. Verification documents are retained for the duration of the verification validity period and securely deleted thereafter. Payment transaction records are retained as required by Nigerian financial regulations.",
      },
      {
        title: "7. Children's Privacy",
        content:
          "The Iṣéyá Platform is intended for users aged 18 years and above. We do not knowingly collect personal information from individuals under 18. If we become aware that we have collected data from a person under 18, we will take immediate steps to delete such information from our systems. If you believe a minor has provided us with personal data, please contact us immediately so we can take appropriate action.",
      },
      {
        title: "8. Third-Party Services",
        content:
          "The Platform may contain links to third-party websites and integrates with third-party services including payment processors (Paystack and Flutterwave). These third parties have their own privacy policies, and we are not responsible for their practices. We encourage you to review the privacy policies of any third-party services you interact with through the Platform. Our use of third-party services is governed by our agreements with those providers and applicable data protection laws.",
      },
      {
        title: "9. Changes to This Policy",
        content:
          "We may update this Privacy Policy from time to time to reflect changes in our practices, technology, legal requirements, or other factors. We will notify registered users of significant changes via email or through a prominent notice on the Platform. The updated policy will be effective from the date of posting. Your continued use of the Platform after changes are posted constitutes your acceptance of the revised Privacy Policy. We encourage you to review this policy periodically.",
      },
      {
        title: "10. Contact Us",
        content:
          "If you have any questions, concerns, or requests regarding this Privacy Policy or our data practices, please contact our Data Protection Officer at privacy@iseya.com. You may also reach us through the contact form on our Platform or write to Renowned Technology Limited at our registered office address. We are committed to resolving any privacy-related concerns in a timely manner and in compliance with the Nigeria Data Protection Regulation (NDPR).",
      },
    ],
  },
};

export const privacyPage: PageDef = {
  key: "page_privacy",
  label: "Privacy Policy",
  description: "The Privacy Policy page. Edit the page title, intro, last updated line, and the list of policy sections.",
  defaults: privacyDefaults,
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
      label: "Policy Sections",
      description: "The list of policy sections shown as cards.",
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
  ],
};
