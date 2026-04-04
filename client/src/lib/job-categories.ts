export type JobSector = {
  name: string;
  subcategories: string[];
};

export const jobSectors: JobSector[] = [
  {
    name: "Administration & Finance",
    subcategories: [
      "Accountant",
      "Administrative Officer",
      "Bookkeeper",
      "Data Entry Clerk",
      "Financial Analyst",
      "Human Resources Officer",
      "Office Assistant",
      "Payroll Specialist",
      "Virtual Assistant",
    ],
  },
  {
    name: "Agriculture & Farming",
    subcategories: [
      "Agricultural Officer",
      "Farm Worker",
      "Veterinary Assistant",
    ],
  },
  {
    name: "Arts & Communications",
    subcategories: [
      "Broadcaster / Presenter",
      "Journalist",
      "Public Relations Officer",
      "Stylist (Barbing)",
      "Stylist (Fashion)",
      "Stylist (Ladies)",
      "Stylist (Spa)",
      "Stylist (Unisex)",
      "Tailor / Fashion Designer Assistant",
      "Writer / Author",
    ],
  },
  {
    name: "Construction & Labour",
    subcategories: [
      "Box Production Worker",
      "Construction Worker",
      "Factory Worker / Casual Labourer",
      "Mason / Bricklayer",
    ],
  },
  {
    name: "Customer Support",
    subcategories: [
      "Call Centre Agent",
      "Client Services Officer",
      "Customer Service Representative",
      "Help Desk Analyst",
      "Tech Support Specialist",
    ],
  },
  {
    name: "Domestic & Household",
    subcategories: [
      "Cleaner / Janitor",
      "Cook (Domestic)",
      "Gardener",
      "Laundry Attendant",
      "Nanny / Caregiver",
    ],
  },
  {
    name: "Education & Training",
    subcategories: [
      "Childcare Worker",
      "Corporate Trainer",
      "Professor / Lecturer",
      "Residential Advisor",
      "School Administrator",
      "Teacher",
      "Tutor",
    ],
  },
  {
    name: "Engineering & Architecture",
    subcategories: [
      "Architect",
      "CAD Technician",
      "Civil Engineer",
      "Electrical Engineer",
      "Mechanical Engineer",
      "Quantity Surveyor",
      "Site Engineer",
    ],
  },
  {
    name: "Events & Entertainment",
    subcategories: [
      "DJ / MC",
      "Event Planner",
      "Funeral Service Worker",
      "Recreation & Fitness Worker",
    ],
  },
  {
    name: "Government & Public Safety",
    subcategories: [
      "Civil Servant",
      "Law Enforcement Officer",
      "Public Policy Analyst",
      "Social Worker",
    ],
  },
  {
    name: "Healthcare & Medicine",
    subcategories: [
      "Community Health Worker",
      "Healthcare Administrator",
      "Lab Technician",
      "Nurse",
      "Personal Care Aide",
      "Pharmacist",
      "Physician",
      "Physiotherapist",
    ],
  },
  {
    name: "Hospitality & Food Service",
    subcategories: [
      "Barista",
      "Barman / Bartender",
      "Cook",
      "Fast Food Attendant",
      "Housekeeper / Room Attendant",
      "Kitchen Assistant / Steward",
      "Kitchen Manager",
      "Line Cook / Prep Cook",
      "Porter / Luggage Handler",
      "Receptionist",
      "Server",
      "Spa Therapist / Attendant",
      "Tour & Travel Guide",
      "Waiter / Waitress",
    ],
  },
  {
    name: "Marketing & Creative",
    subcategories: [
      "Brand Strategist",
      "Content Marketer",
      "Copywriter",
      "Digital Marketing Specialist",
      "Graphic Designer",
      "Photographer",
      "SEO Specialist",
      "Social Media Manager",
      "Video Editor",
    ],
  },
  {
    name: "Project Management & Operations",
    subcategories: [
      "Logistics Coordinator",
      "Operations Manager",
      "Product Manager",
      "Project Manager",
      "Supply Chain Manager",
    ],
  },
  {
    name: "Retail & Sales",
    subcategories: [
      "Cashier",
      "Sales Assistant / Attendant",
      "Shelf Attendant / Merchandiser",
      "Store Keeper / Inventory Officer",
    ],
  },
  {
    name: "Sales & Business Development",
    subcategories: [
      "Account Executive",
      "Account Manager",
      "Business Development Manager",
      "Sales Development Rep (SDR)",
      "Sales Representative",
    ],
  },
  {
    name: "Security & Safety",
    subcategories: [
      "Safety Officer",
      "Security Guard",
      "Security Officer",
    ],
  },
  {
    name: "Technology & IT",
    subcategories: [
      "Cybersecurity Analyst",
      "Data Analyst",
      "Database Administrator",
      "DevOps Engineer",
      "IT Support Specialist",
      "Mobile App Developer",
      "Network Engineer",
      "QA / Test Engineer",
      "Software Developer",
      "Software Engineer",
      "Systems Administrator",
      "Systems Analyst",
      "UI/UX Designer",
      "Web Developer",
    ],
  },
  {
    name: "Trades & Maintenance",
    subcategories: [
      "Carpenter",
      "Electrician",
      "HVAC Technician",
      "Maintenance Man",
      "Painter",
      "Plumber",
      "Repair Technician",
      "Welder",
    ],
  },
  {
    name: "Transport & Logistics",
    subcategories: [
      "Dispatch Rider",
      "Driver (Casual)",
      "Fleet Manager",
      "Logistics Officer",
    ],
  },
  {
    name: "Other",
    subcategories: [
      "Other",
    ],
  },
];

export const allJobCategories: string[] = jobSectors.flatMap(s => s.subcategories);

export const allSectorNames: string[] = jobSectors.map(s => s.name);

export function getSectorForCategory(category: string): string | undefined {
  return jobSectors.find(s => s.subcategories.includes(category))?.name;
}

export function getSubcategoriesForSector(sectorName: string): string[] {
  return jobSectors.find(s => s.name === sectorName)?.subcategories || [];
}

export const businessCategories = [
  "Administration & Finance",
  "Agriculture & Farming",
  "Arts & Communications",
  "Banking & Financial Services",
  "Cleaning & Maintenance",
  "Consulting & Professional Services",
  "Construction & Labour",
  "Domestic & Household",
  "Education & Tutoring",
  "Engineering & Architecture",
  "Event Management",
  "Government & Public Service",
  "Healthcare & Wellness",
  "Hospitality & Hotels",
  "Legal Services",
  "Logistics & Delivery",
  "Manufacturing",
  "Marketing & Creative",
  "Oil & Gas / Energy",
  "Real Estate",
  "Restaurant & Food Service",
  "Retail & Sales",
  "Sales & Business Development",
  "Security Services",
  "Technology & IT",
  "Telecommunications",
  "Transportation",
  "Other",
];
