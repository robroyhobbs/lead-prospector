import { UnifiedLead } from "../../processors/types";

export interface ScoringCriteria {
  // Domain characteristics
  domainLength?: {
    min?: number;
    max?: number;
    weight: number;
  };
  domainExtension?: {
    preferred: string[];
    weight: number;
  };
  domainKeywords?: {
    keywords: string[];
    weight: number;
  };

  // Price characteristics
  priceRange?: {
    min?: number;
    max?: number;
    weight: number;
  };
  priceNegotiability?: {
    weight: number;
  };

  // Traffic characteristics
  trafficRange?: {
    min?: number;
    max?: number;
    weight: number;
  };
  trafficGrowth?: {
    weight: number;
  };

  // Seller characteristics
  sellerPortfolioSize?: {
    min?: number;
    max?: number;
    weight: number;
  };
  sellerResponseTime?: {
    weight: number;
  };
  sellerRating?: {
    weight: number;
  };

  // Category characteristics
  categoryMatch?: {
    preferred: string[];
    weight: number;
  };
  categoryExclusion?: {
    excluded: string[];
    weight: number;
  };

  // Market characteristics
  marketDemand?: {
    weight: number;
  };
  marketCompetition?: {
    weight: number;
  };
}

export interface LeadScore {
  lead: UnifiedLead;
  totalScore: number;
  categoryScores: {
    domain: number;
    price: number;
    traffic: number;
    seller: number;
    category: number;
    market: number;
  };
  details: {
    domainLength?: number;
    domainExtension?: number;
    domainKeywords?: number;
    priceRange?: number;
    priceNegotiability?: number;
    trafficRange?: number;
    trafficGrowth?: number;
    sellerPortfolioSize?: number;
    sellerResponseTime?: number;
    sellerRating?: number;
    categoryMatch?: number;
    categoryExclusion?: number;
    marketDemand?: number;
    marketCompetition?: number;
  };
  recommendations: string[];
}

export interface LeadScorerConfig {
  criteria: ScoringCriteria;
  minScore?: number;
  maxScore?: number;
  autoQualify?: {
    minScore: number;
    status: string;
  };
} 