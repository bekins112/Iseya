import type { PageDef } from "./types";

export const disclaimerDefaults = {
  header: {
    title: "Disclaimer",
    intro: "Please read this disclaimer carefully before using the Iṣéyá platform.",
    lastUpdated: "Last updated: February 2026",
  },
  sections: {
    items: [
      {
        title: "General Information",
        content: "Iṣéyá is a product of Renowned Technology Limited. The information provided on Iṣéyá (the \"Platform\") is for general informational purposes only. While we strive to keep all information accurate and up-to-date, we make no representations or warranties of any kind, express or implied, about the completeness, accuracy, reliability, or suitability of the information, products, services, or related graphics contained on the Platform.",
      },
      {
        title: "No Employment Guarantee",
        content: "Iṣéyá serves as a marketplace connecting job seekers (applicants) with employers. We do not guarantee employment, job placement, or any specific outcome from using the Platform. The hiring decision rests solely with the employer, and acceptance of a job offer is at the applicant's discretion. Iṣéyá is not an employer and does not enter into employment relationships with users.",
      },
      {
        title: "User Responsibility",
        content: "Users are solely responsible for the accuracy of the information they provide on the Platform, including but not limited to personal details, qualifications, job descriptions, salary offers, and company information. Iṣéyá does not verify the accuracy of user-submitted content unless explicitly stated (such as through our optional verification service). Users agree to conduct their own due diligence before entering into any arrangement with another user.",
      },
      {
        title: "Limitation of Liability",
        content: "To the fullest extent permitted by Nigerian law, Renowned Technology Limited (trading as Iṣéyá), its owners, directors, employees, and agents shall not be liable for any direct, indirect, incidental, consequential, or punitive damages arising out of or relating to the use of, or inability to use, the Platform. This includes but is not limited to damages for loss of profits, goodwill, data, or other intangible losses, even if Renowned Technology Limited has been advised of the possibility of such damages.",
      },
      {
        title: "Third-Party Services",
        content: "The Platform integrates with third-party payment processors (Paystack and Flutterwave) for subscription and verification payments. Iṣéyá is not responsible for the actions, policies, or practices of these third-party services. Users are encouraged to review the terms and privacy policies of these services independently. Any transactions processed through these services are subject to their respective terms of service.",
      },
      {
        title: "Verification Service",
        content: "Our applicant verification service is provided as an optional feature to enhance trust on the Platform. While we make reasonable efforts to review submitted documents, verification does not constitute a comprehensive background check or endorsement of any individual. Employers should exercise their own judgement and conduct additional checks as they deem necessary before hiring.",
      },
      {
        title: "Age Restriction",
        content: "The Platform is intended for users aged 16 years and above. By using Iṣéyá, you confirm that you meet this age requirement. Users under 16 are not permitted to create accounts or use the Platform's services. Iṣéyá reserves the right to terminate accounts found to be in violation of this policy.",
      },
      {
        title: "Intellectual Property",
        content: "All content, trademarks, logos, and intellectual property displayed on the Platform are the property of Renowned Technology Limited or their respective owners. Users may not reproduce, distribute, modify, or create derivative works from any content on the Platform without prior written consent from Renowned Technology Limited.",
      },
      {
        title: "Changes to This Disclaimer",
        content: "Iṣéyá reserves the right to update or modify this disclaimer at any time without prior notice. Continued use of the Platform after any changes constitutes acceptance of the revised disclaimer. Users are encouraged to review this page periodically for updates.",
      },
      {
        title: "Governing Law",
        content: "This disclaimer shall be governed by and construed in accordance with the laws of the Federal Republic of Nigeria. Any disputes arising from or in connection with the use of the Platform shall be subject to the exclusive jurisdiction of Nigerian courts.",
      },
    ],
  },
  footer: {
    note: "By using Iṣéyá, you acknowledge that you have read, understood, and agree to this disclaimer. If you have any questions, please",
    contactLabel: "contact us",
  },
};

export const disclaimerPage: PageDef = {
  key: "page_disclaimer",
  label: "Disclaimer",
  description: "The Disclaimer page. Edit the title, intro, last-updated line, and the full list of disclaimer sections.",
  defaults: disclaimerDefaults,
  sections: [
    {
      key: "header",
      label: "Header",
      fields: [
        { key: "title", label: "Title", type: "text" },
        { key: "intro", label: "Intro paragraph", type: "textarea" },
        { key: "lastUpdated", label: "Last updated line", type: "text" },
      ],
    },
    {
      key: "sections",
      label: "Disclaimer Sections",
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
        { key: "note", label: "Acknowledgment text", type: "textarea" },
        { key: "contactLabel", label: "Contact link label", type: "text" },
      ],
    },
  ],
};
