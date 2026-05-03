export function calculateAge(dateOfBirth: string): number {
  const dob = new Date(dateOfBirth);
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const monthDiff = today.getMonth() - dob.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
    age--;
  }
  return age;
}

export function getAge(user: { dateOfBirth?: string | null; age?: number | null }): number | null {
  if (user.dateOfBirth) return calculateAge(user.dateOfBirth);
  if (user.age) return user.age;
  return null;
}

export function isAtLeast18(dateOfBirth: string): boolean {
  return calculateAge(dateOfBirth) >= 18;
}

export function getMaxDobFor18(): string {
  const today = new Date();
  const maxDate = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate());
  return maxDate.toISOString().split("T")[0];
}

export function getMinDobDate(): string {
  const today = new Date();
  const minDate = new Date(today.getFullYear() - 100, today.getMonth(), today.getDate());
  return minDate.toISOString().split("T")[0];
}
