import type { PageDef } from "./types";

export const jobAidDefaults = {
  hero: {
    badge: "Job-Aid Plans",
    title: "Land Your Next Job",
    highlight: "Faster",
    subtitle: "Get expert help finding work. Choose a Job-Aid plan and unlock personalized recommendations, referrals, CV refining, interview booking and more.",
  },
  landing: {
    badge: "Get Hired Faster",
    heading: "Need Help Landing a Job?",
    subtitle: "Our Job-Aid plans give job seekers a real edge — personalized recommendations, direct referrals, CV refining and interview support.",
    button: "Explore Job-Aid Plans",
  },
  info: {
    heading: "Why Job-Aid?",
    subtitle: "Give your job search the professional support it deserves.",
  },
};

export const jobAidPage: PageDef = {
  key: "page_jobaid",
  label: "Job-Aid Page",
  description: "The public Job-Aid plans page and the Job-Aid section on the homepage.",
  defaults: jobAidDefaults,
  sections: [
    {
      key: "hero",
      label: "Page Hero",
      fields: [
        { key: "badge", label: "Badge", type: "text" },
        { key: "title", label: "Title (before highlight)", type: "text" },
        { key: "highlight", label: "Highlighted word", type: "text" },
        { key: "subtitle", label: "Subtitle", type: "textarea" },
      ],
    },
    {
      key: "landing",
      label: "Homepage Section",
      fields: [
        { key: "badge", label: "Badge", type: "text" },
        { key: "heading", label: "Heading", type: "text" },
        { key: "subtitle", label: "Subtitle", type: "textarea" },
        { key: "button", label: "Button label", type: "text" },
      ],
    },
    {
      key: "info",
      label: "Why Job-Aid Section",
      fields: [
        { key: "heading", label: "Heading", type: "text" },
        { key: "subtitle", label: "Subtitle", type: "textarea" },
      ],
    },
  ],
};
