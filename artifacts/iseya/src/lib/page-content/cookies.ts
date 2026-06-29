import type { PageDef } from "./types";

export const cookiesDefaults = {
  header: {
    title: "Cookie Policy",
    intro: "Learn how Iṣéyá uses cookies to improve your experience on the Platform.",
    lastUpdated: "Last updated: February 2026",
  },
  sections: {
    items: [
      {
        title: "What Are Cookies",
        content: "Cookies are small text files that are stored on your device (computer, tablet, or mobile phone) when you visit a website. They are widely used to make websites work more efficiently, provide a better browsing experience, and give website owners useful information. Cookies help us remember your preferences, understand how you use our Platform, and improve your overall experience on Iṣéyá.",
      },
      {
        title: "How We Use Cookies",
        content: "Iṣéyá uses cookies to enhance your experience on the Platform. We use cookies to keep you signed in to your account, remember your preferences and settings, understand how you interact with the Platform, improve our services based on usage patterns, and ensure the security of your account. We are committed to using cookies responsibly and transparently.",
      },
      {
        title: "Types of Cookies",
        content: "We use the following types of cookies on the Platform:\n\nEssential Cookies: These cookies are strictly necessary for the Platform to function. They enable core features such as authentication, session management, and security. Without these cookies, the Platform cannot operate properly. These cookies cannot be disabled.\n\nAnalytics Cookies: These cookies help us understand how users interact with the Platform by collecting anonymous usage data. They allow us to measure traffic, identify popular features, and detect issues. This information helps us continuously improve the Platform.\n\nPreference Cookies: These cookies remember your choices and settings, such as your preferred language, theme (light or dark mode), and other display preferences. They provide a more personalised experience when you return to the Platform.",
      },
      {
        title: "Third-Party Cookies",
        content: "Some cookies on the Platform are set by third-party services that we integrate with, including payment processors (Paystack and Flutterwave) and analytics tools. These third-party cookies are governed by the respective privacy policies of those services. We do not control these cookies and recommend reviewing the privacy policies of these third-party providers. Third-party cookies may be used for fraud prevention, payment processing, and service analytics.",
      },
      {
        title: "Managing Cookies",
        content: "You can control and manage cookies in your browser settings. Most browsers allow you to view, delete, and block cookies from websites. Please note that disabling essential cookies may affect the functionality of the Platform and prevent you from using certain features. You can typically find cookie settings in your browser's \"Settings\", \"Privacy\", or \"Security\" section. You can also use the cookie preferences on our Platform to manage which non-essential cookies you accept.",
      },
      {
        title: "Cookie Duration",
        content: "Cookies used on the Platform have varying lifespans:\n\nSession Cookies: These are temporary cookies that are deleted when you close your browser. They are used to maintain your session while you browse the Platform.\n\nPersistent Cookies: These cookies remain on your device for a set period or until you manually delete them. They are used to remember your preferences and recognise you when you return to the Platform. The duration of persistent cookies varies depending on their purpose, ranging from a few days to up to one year.",
      },
      {
        title: "Updates to This Policy",
        content: "Iṣéyá reserves the right to update this Cookie Policy at any time to reflect changes in our practices, technology, or legal requirements. Any significant changes will be communicated through the Platform. The \"Last updated\" date at the top of this page indicates when this policy was last revised. We encourage you to review this policy periodically to stay informed about how we use cookies.",
      },
      {
        title: "Contact Us",
        content: "If you have any questions or concerns about our use of cookies, please do not hesitate to reach out to us. You can contact us through our Contact page, or email us at support@iseya.com. We are committed to addressing your concerns and ensuring your privacy is protected while using the Iṣéyá platform.",
      },
    ],
  },
  footer: {
    note: "By continuing to use Iṣéyá, you acknowledge that you have read and understood this Cookie Policy. If you have any questions, please",
    linkLabel: "contact us",
  },
};

export const cookiesPage: PageDef = {
  key: "page_cookies",
  label: "Cookie Policy",
  description: "The Cookie Policy legal page. Edit the title, intro, and the full list of policy sections.",
  defaults: cookiesDefaults,
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
      description: "The list of cookie policy sections.",
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
        { key: "linkLabel", label: "Contact link label", type: "text" },
      ],
    },
  ],
};
