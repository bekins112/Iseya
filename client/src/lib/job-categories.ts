export type JobSector = {
  name: string;
  subcategories: string[];
};

export const jobSectors: JobSector[] = [
  {
    name: "Hospitality & Food Service",
    subcategories: [
      "Waiter / Waitress",
      "Barman / Bartender",
      "Housekeeper / Room Attendant",
      "Kitchen Assistant / Steward",
      "Cook",
      "Porter / Luggage Handler",
      "Spa Therapist / Attendant",
      "Receptionist",
      "Line Cook / Prep Cook",
      "Barista",
      "Fast Food Attendant",
      "Kitchen Manager",
      "Server",
      "Tour & Travel Guide",
    ],
  },
  {
    name: "Retail & Sales",
    subcategories: [
      "Sales Assistant / Attendant",
      "Cashier",
      "Shelf Attendant / Merchandiser",
      "Store Keeper / Inventory Officer",
    ],
  },
  {
    name: "Sales & Business Development",
    subcategories: [
      "Sales Representative",
      "Business Development Manager",
      "Account Executive",
      "Sales Development Rep (SDR)",
      "Account Manager",
    ],
  },
  {
    name: "Technology & IT",
    subcategories: [
      "Software Developer",
      "Software Engineer",
      "Web Developer",
      "Mobile App Developer",
      "DevOps Engineer",
      "IT Support Specialist",
      "Systems Administrator",
      "Systems Analyst",
      "Cybersecurity Analyst",
      "Data Analyst",
      "Database Administrator",
      "Network Engineer",
      "UI/UX Designer",
      "QA / Test Engineer",
    ],
  },
  {
    name: "Marketing & Creative",
    subcategories: [
      "Social Media Manager",
      "Content Marketer",
      "SEO Specialist",
      "Graphic Designer",
      "Copywriter",
      "Digital Marketing Specialist",
      "Brand Strategist",
      "Video Editor",
      "Photographer",
    ],
  },
  {
    name: "Administration & Finance",
    subcategories: [
      "Office Assistant",
      "Virtual Assistant",
      "Accountant",
      "Bookkeeper",
      "Payroll Specialist",
      "Financial Analyst",
      "Human Resources Officer",
      "Administrative Officer",
      "Data Entry Clerk",
    ],
  },
  {
    name: "Project Management & Operations",
    subcategories: [
      "Project Manager",
      "Operations Manager",
      "Product Manager",
      "Supply Chain Manager",
      "Logistics Coordinator",
    ],
  },
  {
    name: "Customer Support",
    subcategories: [
      "Customer Service Representative",
      "Client Services Officer",
      "Tech Support Specialist",
      "Call Centre Agent",
      "Help Desk Analyst",
    ],
  },
  {
    name: "Healthcare & Medicine",
    subcategories: [
      "Nurse",
      "Physician",
      "Pharmacist",
      "Healthcare Administrator",
      "Lab Technician",
      "Community Health Worker",
      "Personal Care Aide",
      "Physiotherapist",
    ],
  },
  {
    name: "Engineering & Architecture",
    subcategories: [
      "Civil Engineer",
      "Mechanical Engineer",
      "Electrical Engineer",
      "CAD Technician",
      "Architect",
      "Quantity Surveyor",
      "Site Engineer",
    ],
  },
  {
    name: "Education & Training",
    subcategories: [
      "Teacher",
      "Professor / Lecturer",
      "Corporate Trainer",
      "School Administrator",
      "Tutor",
      "Childcare Worker",
      "Residential Advisor",
    ],
  },
  {
    name: "Arts & Communications",
    subcategories: [
      "Writer / Author",
      "Journalist",
      "Public Relations Officer",
      "Broadcaster / Presenter",
      "Stylist (Fashion)",
      "Stylist (Unisex)",
      "Stylist (Ladies)",
      "Stylist (Barbing)",
      "Stylist (Spa)",
      "Tailor / Fashion Designer Assistant",
    ],
  },
  {
    name: "Trades & Maintenance",
    subcategories: [
      "Plumber",
      "Electrician",
      "Welder",
      "HVAC Technician",
      "Repair Technician",
      "Maintenance Man",
      "Carpenter",
      "Painter",
    ],
  },
  {
    name: "Construction & Labour",
    subcategories: [
      "Factory Worker / Casual Labourer",
      "Construction Worker",
      "Box Production Worker",
      "Mason / Bricklayer",
    ],
  },
  {
    name: "Transport & Logistics",
    subcategories: [
      "Driver (Casual)",
      "Dispatch Rider",
      "Logistics Officer",
      "Fleet Manager",
    ],
  },
  {
    name: "Security & Safety",
    subcategories: [
      "Security Guard",
      "Security Officer",
      "Safety Officer",
    ],
  },
  {
    name: "Domestic & Household",
    subcategories: [
      "Nanny / Caregiver",
      "Cleaner / Janitor",
      "Cook (Domestic)",
      "Gardener",
      "Laundry Attendant",
    ],
  },
  {
    name: "Government & Public Safety",
    subcategories: [
      "Law Enforcement Officer",
      "Public Policy Analyst",
      "Social Worker",
      "Civil Servant",
    ],
  },
  {
    name: "Agriculture & Farming",
    subcategories: [
      "Farm Worker",
      "Agricultural Officer",
      "Veterinary Assistant",
    ],
  },
  {
    name: "Events & Entertainment",
    subcategories: [
      "Event Planner",
      "DJ / MC",
      "Funeral Service Worker",
      "Recreation & Fitness Worker",
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
  "Restaurant & Food Service",
  "Hospitality & Hotels",
  "Retail & Sales",
  "Construction & Labour",
  "Cleaning & Maintenance",
  "Logistics & Delivery",
  "Agriculture & Farming",
  "Event Management",
  "Domestic & Household",
  "Manufacturing",
  "Security Services",
  "Healthcare & Wellness",
  "Education & Tutoring",
  "Transportation",
  "Technology & IT",
  "Sales & Business Development",
  "Marketing & Creative",
  "Administration & Finance",
  "Engineering & Architecture",
  "Government & Public Service",
  "Arts & Communications",
  "Consulting & Professional Services",
  "Real Estate",
  "Legal Services",
  "Telecommunications",
  "Oil & Gas / Energy",
  "Banking & Financial Services",
  "Other",
];
