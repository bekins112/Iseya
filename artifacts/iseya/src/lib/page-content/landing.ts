import type { PageDef } from "./types";

export const landingDefaults = {
  banner: {
    ctaLabel: "Browse Jobs",
  },
  hero: {
    title: "Start Finding",
    highlight: "Jobs",
    titleAfter: "Today",
    subtitle: "Discover flexible work opportunities near you. No CV required, just your skills and availability.",
    ctaPrimary: "Get Started",
    ctaBrowse: "Browse Jobs",
  },
  search: {
    heading: "Find Jobs That Match You",
    subtitle: "Search and discover flexible work opportunities near you.",
    popularLabel: "Popular Searches",
  },
  features: {
    heading: "Built for Modern Work",
    subtitle: "Everything you need to find or list casual work in minutes.",
  },
  howItWorks: {
    badge: "Simple & Fast",
    heading: "How It Works",
    subtitle: "Get started in just a few simple steps — whether you're looking for work or hiring.",
  },
  testimonials: {
    heading: "What Our Members Say",
    subtitle: "Real stories from workers and employers who found success on Iseya.",
  },
  employerCta: {
    heading: "Looking to Hire?",
    subtitle: "Post jobs and find reliable workers fast. Create an employer account and start hiring within minutes.",
  },
  jobAid: {
    badge: "Get Hired Faster",
    heading: "Need Help Landing a Job?",
    subtitle: "Our Job-Aid plans give job seekers a real edge — personalized recommendations, direct referrals, CV refining and interview support.",
    button: "Explore Job-Aid Plans",
  },
  agent: {
    badge: "Earn Money on Iṣéyá",
    heading: "Earn Money as a Recruitment Agent",
    body: "Turn your network into income. Join Iṣéyá as an agent, connect employers with verified workers, and earn commission on every successful placement. No office needed — work from anywhere in Nigeria.",
    buttonPrimary: "Start Earning Today",
    buttonSecondary: "Register as Agent",
  },
  readyToJoin: {
    heading: "Ready to jump in?",
    button: "Create Free Account",
  },
  hiringCompanies: {
    badge: "Trusted by Leading Brands",
    heading: "Companies Currently Hiring in Nigeria",
    subtitle: "Join thousands of professionals working with these top employers on Iṣéyá.",
  },
};

export const landingPage: PageDef = {
  key: "page_landing",
  label: "Landing Page",
  description: "The main homepage. Manage the sliding banners and the text of each section.",
  defaults: landingDefaults,
  sections: [
    {
      key: "banners",
      label: "Hero Banners (Slider)",
      kind: "banners",
      description: "The sliding images at the very top of the page.",
    },
    {
      key: "banner",
      label: "Banner Button",
      fields: [{ key: "ctaLabel", label: "Banner button label", type: "text" }],
    },
    {
      key: "hero",
      label: "Hero Section",
      fields: [
        { key: "title", label: "Title (before highlight)", type: "text" },
        { key: "highlight", label: "Highlighted word", type: "text" },
        { key: "titleAfter", label: "Title (after highlight)", type: "text" },
        { key: "subtitle", label: "Subtitle", type: "textarea" },
        { key: "ctaPrimary", label: "Primary button label", type: "text" },
        { key: "ctaBrowse", label: "Browse button label", type: "text" },
      ],
    },
    {
      key: "search",
      label: "Search Section",
      fields: [
        { key: "heading", label: "Heading", type: "text" },
        { key: "subtitle", label: "Subtitle", type: "textarea" },
        { key: "popularLabel", label: "Popular searches label", type: "text" },
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
        { key: "badge", label: "Badge", type: "text" },
        { key: "heading", label: "Heading", type: "text" },
        { key: "subtitle", label: "Subtitle", type: "textarea" },
      ],
    },
    {
      key: "testimonials",
      label: "Testimonials Section",
      fields: [
        { key: "heading", label: "Heading", type: "text" },
        { key: "subtitle", label: "Subtitle", type: "textarea" },
      ],
    },
    {
      key: "employerCta",
      label: "Employer CTA Section",
      fields: [
        { key: "heading", label: "Heading", type: "text" },
        { key: "subtitle", label: "Subtitle", type: "textarea" },
      ],
    },
    {
      key: "jobAid",
      label: "Job-Aid Section",
      fields: [
        { key: "badge", label: "Badge", type: "text" },
        { key: "heading", label: "Heading", type: "text" },
        { key: "subtitle", label: "Subtitle", type: "textarea" },
        { key: "button", label: "Button label", type: "text" },
      ],
    },
    {
      key: "agent",
      label: "Agent Section",
      fields: [
        { key: "badge", label: "Badge", type: "text" },
        { key: "heading", label: "Heading", type: "text" },
        { key: "body", label: "Body", type: "textarea" },
        { key: "buttonPrimary", label: "Primary button label", type: "text" },
        { key: "buttonSecondary", label: "Secondary button label", type: "text" },
      ],
    },
    {
      key: "readyToJoin",
      label: "Ready to Join Section",
      fields: [
        { key: "heading", label: "Heading", type: "text" },
        { key: "button", label: "Button label", type: "text" },
      ],
    },
    {
      key: "hiringCompanies",
      label: "Hiring Companies Section",
      fields: [
        { key: "badge", label: "Badge", type: "text" },
        { key: "heading", label: "Heading", type: "text" },
        { key: "subtitle", label: "Subtitle", type: "textarea" },
      ],
    },
  ],
};
