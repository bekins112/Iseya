import type { PageDef } from "./types";
import { landingPage } from "./landing";
import { aboutPage } from "./about";
import { forApplicantsPage } from "./for-applicants";
import { forEmployersPage } from "./for-employers";
import { forAgentsPage } from "./for-agents";
import { contactPage } from "./contact";
import { faqsPage } from "./faqs";
import { termsPage } from "./terms";
import { privacyPage } from "./privacy";
import { cookiesPage } from "./cookies";
import { copyrightPage } from "./copyright";
import { disclaimerPage } from "./disclaimer";
import { jobAidPage } from "./job-aid";

export const allPages: PageDef[] = [
  landingPage,
  aboutPage,
  forApplicantsPage,
  forEmployersPage,
  forAgentsPage,
  contactPage,
  faqsPage,
  termsPage,
  privacyPage,
  cookiesPage,
  copyrightPage,
  disclaimerPage,
  jobAidPage,
];

export * from "./types";
