import { Agency } from '@/types';

export const calculateAgencyTrustScore = (agency: Agency): { score: number; breakdown: Record<string, number> } => {
  let score = 0;
  const breakdown: Record<string, number> = {
    basicInfo: 0,
    locationInfo: 0,
    verification: 0,
    profileExtras: 0,
  };

  // Basic Info (30%): agencyName, phone, email
  if (agency.agencyName) {
    score += 10;
    breakdown.basicInfo += 10;
  }
  if (agency.phone) {
    score += 10;
    breakdown.basicInfo += 10;
  }
  if (agency.email) {
    score += 10;
    breakdown.basicInfo += 10;
  }

  // Location Info (30%): city, region
  if (agency.city) {
    score += 15;
    breakdown.locationInfo += 15;
  }
  if (agency.region) {
    score += 15;
    breakdown.locationInfo += 15;
  }

  // Verification (30%): license (Text format check)
  if (agency.license && typeof agency.license === 'string' && !agency.license.startsWith('http')) {
    score += 30;
    breakdown.verification += 30;
  }

  // Profile Extras (10%): logo
  if (agency.logo) {
    score += 10;
    breakdown.profileExtras += 10;
  }

  return { score, breakdown };
};
