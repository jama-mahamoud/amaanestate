import { Listing } from '@/types';

export const trustService = {
  calculateTrustScore(listing: Listing): { trustScore: number; riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' } {
    let score = 0;
    
    // Scoring rules:
    // Verified Broker: +20
    if (listing.associatedBrokerId || listing.isVerified) score += 20;
    
    // Legal Agreement Signed: +30
    if (listing.verificationStatus === 'VERIFIED') score += 30;
    
    // Verified Map Location: +15
    if (listing.latitude && listing.longitude) score += 15;
    
    // Owner Verified: +25
    if (listing.ownershipVerified) score += 25;
    
    // No Complaints / Clean History: +10 (Assume clean if not checked specifically for now)
    score += 10;
    
    const finalScore = Math.min(score, 100);
    
    let risk: 'LOW' | 'MEDIUM' | 'HIGH' = 'LOW';
    if (finalScore < 50) risk = 'HIGH';
    else if (finalScore < 80) risk = 'MEDIUM';
    
    return { trustScore: finalScore, riskLevel: risk };
  }
};
