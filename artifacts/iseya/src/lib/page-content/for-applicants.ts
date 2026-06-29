import type { PageDef } from "./types";

export const forApplicantsDefaults = {
  hero: {
    badge: "For Job Seekers",
    title: "Find Casual Jobs",
    highlight: "Near You",
    subtitle: "Browse thousands of part-time, full-time, and contract jobs across Nigeria. Apply instantly, get verified, and start earning.",
    ctaPrimary: "Create Free Account",
    ctaBrowse: "Browse Jobs",
  },
  video: {
    badge: "Watch Video",
    heading: "See How Iṣéyá Works for Job Seekers",
    subtitle: "Watch this short video to learn how to find jobs, apply, and start earning.",
  },
  features: {
    heading: "Why Job Seekers Love Iṣéyá",
    subtitle: "Everything you need to find and land your next opportunity.",
  },
  steps: {
    heading: "How It Works",
    subtitle: "Get started in 4 easy steps",
  },
  benefits: {
    heading: "What You Get",
  },
  cta: {
    heading: "Ready to Find Your Next Job?",
    subtitle: "Join thousands of Nigerians finding flexible work on Iṣéyá. It's free to sign up.",
    ctaPrimary: "Sign Up Free",
    ctaBrowse: "Browse Jobs First",
  },
};

export const forApplicantsPage: PageDef = {
  key: "page_for_applicants",
  label: "For Applicants Page",
  description: "The marketing page for job seekers. Manage the text of each section.",
  defaults: forApplicantsDefaults,
  sections: [
    {
      key: "hero",
      label: "Hero Section",
      fields: [
        { key: "badge", label: "Badge", type: "text" },
        { key: "title", label: "Title (before highlight)", type: "text" },
        { key: "highlight", label: "Highlighted word", type: "text" },
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
        { key: "subtitle", label: "Subtitle", type: "text" },
      ],
    },
    {
      key: "benefits",
      label: "What You Get Section",
      fields: [
        { key: "heading", label: "Heading", type: "text" },
      ],
    },
    {
      key: "cta",
      label: "Bottom CTA Section",
      fields: [
        { key: "heading", label: "Heading", type: "text" },
        { key: "subtitle", label: "Subtitle", type: "textarea" },
        { key: "ctaPrimary", label: "Primary button label", type: "text" },
        { key: "ctaBrowse", label: "Browse button label", type: "text" },
      ],
    },
  ],
};
