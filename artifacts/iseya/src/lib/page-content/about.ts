import type { PageDef } from "./types";

export const aboutDefaults = {
  hero: {
    title: "About Iṣéyá",
    subtitle: "Connecting Nigerian workers with opportunities, one job at a time.",
  },
  mission: {
    heading: "Our Mission",
    paragraph1Start: 'Iṣéyá (meaning "work" in Yoruba) is a product of ',
    companyName: "Renowned Technology Limited",
    paragraph1End:
      ", founded with a simple mission: to bridge the gap between casual workers seeking opportunities and employers looking for reliable help.",
    paragraph2:
      "In Nigeria, millions of hardworking individuals are ready and willing to work, but often lack access to opportunities. We're changing that by creating a platform where talent meets opportunity, regardless of formal qualifications.",
    paragraph3:
      "Whether you're looking for your next casual job or searching for workers to help with your business, Iṣéyá is here to make the connection seamless and trustworthy.",
  },
  values: {
    heading: "Our Values",
  },
  cta: {
    heading: "Ready to Get Started?",
    subtitle: "Join thousands of Nigerians who have found work or hired through Iṣéyá.",
    buttonFindWork: "Find Work",
    buttonHireWorkers: "Hire Workers",
  },
};

export const aboutPage: PageDef = {
  key: "page_about",
  label: "About Page",
  description: "The public About page. Manage the hero, mission, values, and call-to-action text.",
  defaults: aboutDefaults,
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
      key: "mission",
      label: "Mission Section",
      fields: [
        { key: "heading", label: "Heading", type: "text" },
        { key: "paragraph1Start", label: "Paragraph 1 (before company name)", type: "textarea" },
        { key: "companyName", label: "Company name (bold)", type: "text" },
        { key: "paragraph1End", label: "Paragraph 1 (after company name)", type: "textarea" },
        { key: "paragraph2", label: "Paragraph 2", type: "textarea" },
        { key: "paragraph3", label: "Paragraph 3", type: "textarea" },
      ],
    },
    {
      key: "values",
      label: "Values Section",
      fields: [{ key: "heading", label: "Heading", type: "text" }],
    },
    {
      key: "cta",
      label: "Call To Action Section",
      fields: [
        { key: "heading", label: "Heading", type: "text" },
        { key: "subtitle", label: "Subtitle", type: "textarea" },
        { key: "buttonFindWork", label: "Find Work button label", type: "text" },
        { key: "buttonHireWorkers", label: "Hire Workers button label", type: "text" },
      ],
    },
  ],
};
