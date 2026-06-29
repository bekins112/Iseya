import type { PageDef } from "./types";

export const contactDefaults = {
  hero: {
    title: "Contact Us",
    subtitle: "Have questions or feedback? We'd love to hear from you.",
  },
  form: {
    title: "Send us a message",
    description: "Fill out the form below and we'll get back to you within 24 hours.",
    submitLabel: "Send Message",
    successHeading: "Message Sent!",
    successBody: "Thank you for reaching out. We'll respond to your message soon.",
    successButton: "Send Another Message",
  },
  getInTouch: {
    title: "Get in Touch",
    description: "Reach out to us through any of these channels.",
  },
  faqCta: {
    heading: "Looking for quick answers?",
    body: "Check out our FAQ section for answers to common questions.",
    button: "View FAQs",
  },
};

export const contactPage: PageDef = {
  key: "page_contact",
  label: "Contact Page",
  description: "The public contact page. Manage the headings, intro text, and button labels.",
  defaults: contactDefaults,
  sections: [
    {
      key: "hero",
      label: "Hero Section",
      fields: [
        { key: "title", label: "Title", type: "text" },
        { key: "subtitle", label: "Subtitle", type: "textarea" },
      ],
    },
    {
      key: "form",
      label: "Contact Form",
      fields: [
        { key: "title", label: "Heading", type: "text" },
        { key: "description", label: "Description", type: "textarea" },
        { key: "submitLabel", label: "Submit button label", type: "text" },
        { key: "successHeading", label: "Success heading", type: "text" },
        { key: "successBody", label: "Success message", type: "textarea" },
        { key: "successButton", label: "Success button label", type: "text" },
      ],
    },
    {
      key: "getInTouch",
      label: "Get in Touch Section",
      fields: [
        { key: "title", label: "Heading", type: "text" },
        { key: "description", label: "Description", type: "textarea" },
      ],
    },
    {
      key: "faqCta",
      label: "FAQ Call-to-Action",
      fields: [
        { key: "heading", label: "Heading", type: "text" },
        { key: "body", label: "Body", type: "textarea" },
        { key: "button", label: "Button label", type: "text" },
      ],
    },
  ],
};
