import type { User } from "@shared/schema";

export type ProfileCompletenessResult = {
  isComplete: boolean;
  missingFields: string[];
};

export function checkApplicantProfile(user: User): ProfileCompletenessResult {
  const missingFields: string[] = [];

  if (!user.firstName?.trim()) missingFields.push("First name");
  if (!user.lastName?.trim()) missingFields.push("Last name");
  if (!user.phone?.trim()) missingFields.push("Phone number");
  if (!user.gender?.trim()) missingFields.push("Gender");
  if (!user.age || user.age < 18) missingFields.push("Age (must be 18+)");
  if (!user.state?.trim()) missingFields.push("State");

  return {
    isComplete: missingFields.length === 0,
    missingFields,
  };
}

export function checkEmployerProfile(user: User): ProfileCompletenessResult {
  const missingFields: string[] = [];

  if (!user.firstName?.trim()) missingFields.push("First name");
  if (!user.lastName?.trim()) missingFields.push("Last name");
  if (!user.companyName?.trim()) missingFields.push("Company name");
  if (!user.businessCategory?.trim()) missingFields.push("Business category");
  if (!user.companyState?.trim()) missingFields.push("Company state");

  return {
    isComplete: missingFields.length === 0,
    missingFields,
  };
}

export function checkAgentProfile(user: User): ProfileCompletenessResult {
  const missingFields: string[] = [];

  if (!user.firstName?.trim()) missingFields.push("First name");
  if (!user.lastName?.trim()) missingFields.push("Last name");
  if (!(user as any).agencyName?.trim()) missingFields.push("Agency name");
  if (!user.phone?.trim()) missingFields.push("Phone number");
  if (!user.state?.trim()) missingFields.push("State");

  return {
    isComplete: missingFields.length === 0,
    missingFields,
  };
}
