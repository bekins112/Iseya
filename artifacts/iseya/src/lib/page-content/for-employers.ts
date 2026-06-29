import type { PageDef } from "./types";

export const forEmployersDefaults = {
  hero: {
    badge: "For Employers",
    title: "Hire Reliable Workers",
    highlight: "Fast & Easy",
    subtitle: "Post jobs, review verified applicants, and build your team in minutes. Iṣéyá connects you with Nigeria's largest pool of casual workers.",
    ctaPrimary: "Create Employer Account",
    ctaBrowse: "Browse Jobs",
  },
  video: {
    badge: "Watch Video",
    heading: "See How Iṣéyá Works for Employers",
    subtitle: "Watch this short video to learn how you can post jobs, find workers, and grow your business.",
  },
  features: {
    heading: "Everything You Need to Hire",
    subtitle: "Powerful tools to find, vet, and manage your casual workforce — all in one platform.",
  },
  steps: {
    heading: "How It Works",
    subtitle: "Start hiring in 4 simple steps",
  },
  plans: {
    heading: "Choose Your Plan",
    subtitle: "Flexible pricing to match your hiring needs",
    ctaLabel: "Get Started",
  },
  bottomCta: {
    heading: "Ready to Start Hiring?",
    subtitle: "Join thousands of Nigerian businesses finding reliable workers on Iṣéyá.",
    button: "Create Free Account",
  },
};

export const forEmployersPage: PageDef = {
  key: "page_for_employers",
  label: "For Employers Page",
  description: "The marketing page for employers. Manage the text of each section.",
  defaults: forEmployersDefaults,
  sections: [
    {
      key: "hero",
      label: "Hero Section",
      fields: [
        { key: "badge", label: "Badge", type: "text" },
        { key: "title", label: "Title (before highlight)", type: "text" },
        { key: "highlight", label: "Highlighted text", type: "text" },
        { key: "subtitle", label: "Subtitle", type: "textarea" },
        { key: "ctaPrimary", label: "Primary button label", type: "text" },
        { key: "ctaBrowse", label: "Browse button label", type: "text" },
      ],
    },
    {
      key: "video",
      label: "Video Section",
      fields: [
        { key: "badge", label: "Badge", type: "text" },
        { key: "heading", label: "Heading", type: "text" },
        { key: "subtitle", label: "Subtitle", type: "textarea" },
      ],
    },
    {
      key: "features",
      label: "Features Section",
      fields: [
        { key: "heading", label: "Heading", type: "text" },
        { key: "subtitle", label: "Subtitle", type: "textarea" },
      ],
    },
    {
      key: "steps",
      label: "How It Works Section",
      fields: [
        { key: "heading", label: "Heading", type: "text" },
        { key: "subtitle", label: "Subtitle", type: "textarea" },
      ],
    },
    {
      key: "plans",
      label: "Plans Section",
      fields: [
        { key: "heading", label: "Heading", type: "text" },
        { key: "subtitle", label: "Subtitle", type: "textarea" },
        { key: "ctaLabel", label: "Plan button label", type: "text" },
      ],
    },
    {
      key: "bottomCta",
      label: "Bottom CTA Section",
      fields: [
        { key: "heading", label: "Heading", type: "text" },
        { key: "subtitle", label: "Subtitle", type: "textarea" },
        { key: "button", label: "Button label", type: "text" },
      ],
    },
  ],
};
