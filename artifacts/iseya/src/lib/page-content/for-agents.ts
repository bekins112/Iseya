import type { PageDef } from "./types";

export const forAgentsDefaults = {
  hero: {
    badge: "For Recruitment Agents",
    title: "Grow Your Recruitment",
    titleHighlight: "Business with Iṣéyá",
    subtitle: "Post jobs on behalf of your employer clients, access verified talent, and scale your agency — all on one platform.",
    ctaPrimary: "Register as Agent",
    ctaSecondary: "See Current Jobs",
  },
  video: {
    badge: "Watch Video",
    heading: "See How Iṣéyá Works for Agents",
    subtitle: "Watch this short video to learn how you can earn money as a recruitment agent.",
  },
  features: {
    heading: "Built for Recruitment Agencies",
    subtitle: "Tools designed to help you manage job postings across multiple clients.",
  },
  howItWorks: {
    heading: "How It Works",
    subtitle: "Get started in 4 steps",
  },
  benefits: {
    heading: "Agent Benefits",
  },
  bottomCta: {
    heading: "Ready to Become an Agent?",
    subtitle: "Join Iṣéyá as a recruitment agent and start posting jobs for your clients today.",
    button: "Register Now",
  },
};

export const forAgentsPage: PageDef = {
  key: "page_for_agents",
  label: "For Agents Page",
  description: "The marketing page for recruitment agents. Manage the text of each section.",
  defaults: forAgentsDefaults,
  sections: [
    {
      key: "hero",
      label: "Hero Section",
      fields: [
        { key: "badge", label: "Badge", type: "text" },
        { key: "title", label: "Title (line 1)", type: "text" },
        { key: "titleHighlight", label: "Title (highlighted line 2)", type: "text" },
        { key: "subtitle", label: "Subtitle", type: "textarea" },
        { key: "ctaPrimary", label: "Primary button label", type: "text" },
        { key: "ctaSecondary", label: "Secondary button label", type: "text" },
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
      key: "howItWorks",
      label: "How It Works Section",
      fields: [
        { key: "heading", label: "Heading", type: "text" },
        { key: "subtitle", label: "Subtitle", type: "text" },
      ],
    },
    {
      key: "benefits",
      label: "Benefits Section",
      fields: [
        { key: "heading", label: "Heading", type: "text" },
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
