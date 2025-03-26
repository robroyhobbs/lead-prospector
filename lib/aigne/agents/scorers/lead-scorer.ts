import { createScorerAgent } from "../../factory";
import { UnifiedLead } from "../../processors/types";
import { LeadScorerConfig, LeadScore, ScoringCriteria } from "./types";

function calculateDomainScore(lead: UnifiedLead, criteria: ScoringCriteria): number {
  let score = 0;
  const domain = lead.name.toLowerCase();

  // Domain length score
  if (criteria.domainLength) {
    const { min, max, weight } = criteria.domainLength;
    const length = domain.length;
    if ((!min || length >= min) && (!max || length <= max)) {
      score += weight;
    }
  }

  // Domain extension score
  if (criteria.domainExtension) {
    const { preferred, weight } = criteria.domainExtension;
    const extension = domain.split(".").pop();
    if (extension && preferred.includes(extension)) {
      score += weight;
    }
  }

  // Domain keywords score
  if (criteria.domainKeywords) {
    const { keywords, weight } = criteria.domainKeywords;
    const hasKeyword = keywords.some(keyword => domain.includes(keyword.toLowerCase()));
    if (hasKeyword) {
      score += weight;
    }
  }

  return score;
}

function calculatePriceScore(lead: UnifiedLead, criteria: ScoringCriteria): number {
  let score = 0;
  const price = parseFloat(lead.price.replace(/[^0-9.]/g, ""));

  // Price range score
  if (criteria.priceRange) {
    const { min, max, weight } = criteria.priceRange;
    if ((!min || price >= min) && (!max || price <= max)) {
      score += weight;
    }
  }

  // Price negotiability score
  if (criteria.priceNegotiability) {
    const { weight } = criteria.priceNegotiability;
    // Check if price is negotiable based on metadata
    const isNegotiable = lead.metadata?.priceNegotiable || false;
    if (isNegotiable) {
      score += weight;
    }
  }

  return score;
}

function calculateTrafficScore(lead: UnifiedLead, criteria: ScoringCriteria): number {
  let score = 0;
  const traffic = parseInt(lead.traffic.replace(/[^0-9]/g, ""));

  // Traffic range score
  if (criteria.trafficRange) {
    const { min, max, weight } = criteria.trafficRange;
    if ((!min || traffic >= min) && (!max || traffic <= max)) {
      score += weight;
    }
  }

  // Traffic growth score
  if (criteria.trafficGrowth) {
    const { weight } = criteria.trafficGrowth;
    // Check if traffic is growing based on metadata
    const isGrowing = lead.metadata?.trafficGrowing || false;
    if (isGrowing) {
      score += weight;
    }
  }

  return score;
}

function calculateSellerScore(lead: UnifiedLead, criteria: ScoringCriteria): number {
  let score = 0;

  // Seller portfolio size score
  if (criteria.sellerPortfolioSize) {
    const { min, max, weight } = criteria.sellerPortfolioSize;
    const portfolioSize = lead.seller.portfolioSize || 0;
    if ((!min || portfolioSize >= min) && (!max || portfolioSize <= max)) {
      score += weight;
    }
  }

  // Seller response time score
  if (criteria.sellerResponseTime) {
    const { weight } = criteria.sellerResponseTime;
    // Check seller response time based on metadata
    const responseTime = lead.metadata?.sellerResponseTime;
    if (responseTime && responseTime < 24) { // Less than 24 hours
      score += weight;
    }
  }

  // Seller rating score
  if (criteria.sellerRating) {
    const { weight } = criteria.sellerRating;
    // Check seller rating based on metadata
    const rating = lead.metadata?.sellerRating;
    if (rating && rating >= 4.5) {
      score += weight;
    }
  }

  return score;
}

function calculateCategoryScore(lead: UnifiedLead, criteria: ScoringCriteria): number {
  let score = 0;

  // Category match score
  if (criteria.categoryMatch) {
    const { preferred, weight } = criteria.categoryMatch;
    if (preferred.includes(lead.category)) {
      score += weight;
    }
  }

  // Category exclusion score
  if (criteria.categoryExclusion) {
    const { excluded, weight } = criteria.categoryExclusion;
    if (!excluded.includes(lead.category)) {
      score += weight;
    }
  }

  return score;
}

function calculateMarketScore(lead: UnifiedLead, criteria: ScoringCriteria): number {
  let score = 0;

  // Market demand score
  if (criteria.marketDemand) {
    const { weight } = criteria.marketDemand;
    // Check market demand based on metadata
    const demand = lead.metadata?.marketDemand;
    if (demand && demand > 0.7) { // High demand
      score += weight;
    }
  }

  // Market competition score
  if (criteria.marketCompetition) {
    const { weight } = criteria.marketCompetition;
    // Check market competition based on metadata
    const competition = lead.metadata?.marketCompetition;
    if (competition && competition < 0.3) { // Low competition
      score += weight;
    }
  }

  return score;
}

function generateRecommendations(score: LeadScore): string[] {
  const recommendations: string[] = [];

  // Domain recommendations
  if (score.categoryScores.domain < 0.5) {
    recommendations.push("Consider domain name optimization for better marketability");
  }

  // Price recommendations
  if (score.categoryScores.price < 0.5) {
    recommendations.push("Price may be outside optimal range for this market");
  }

  // Traffic recommendations
  if (score.categoryScores.traffic < 0.5) {
    recommendations.push("Traffic levels may need improvement for better ROI");
  }

  // Seller recommendations
  if (score.categoryScores.seller < 0.5) {
    recommendations.push("Seller profile may indicate slower response times");
  }

  // Category recommendations
  if (score.categoryScores.category < 0.5) {
    recommendations.push("Category may not align with target market");
  }

  // Market recommendations
  if (score.categoryScores.market < 0.5) {
    recommendations.push("Market conditions may not be optimal for this domain");
  }

  return recommendations;
}

export function createLeadScorer(config: LeadScorerConfig) {
  return createScorerAgent(
    "LeadScorer",
    "Scores leads based on various criteria",
    [
      async (input: { lead: UnifiedLead }) => {
        const { lead } = input;
        const { criteria } = config;

        // Calculate scores for each category
        const domainScore = calculateDomainScore(lead, criteria);
        const priceScore = calculatePriceScore(lead, criteria);
        const trafficScore = calculateTrafficScore(lead, criteria);
        const sellerScore = calculateSellerScore(lead, criteria);
        const categoryScore = calculateCategoryScore(lead, criteria);
        const marketScore = calculateMarketScore(lead, criteria);

        // Calculate total score
        const totalScore = domainScore + priceScore + trafficScore + sellerScore + categoryScore + marketScore;

        // Normalize scores to 0-1 range
        const maxPossibleScore = Object.values(criteria)
          .filter(criterion => criterion && typeof criterion === "object" && "weight" in criterion)
          .reduce((sum, criterion) => sum + (criterion as { weight: number }).weight, 0);

        const normalizedTotalScore = totalScore / maxPossibleScore;

        // Create detailed score object
        const score: LeadScore = {
          lead,
          totalScore: normalizedTotalScore,
          categoryScores: {
            domain: domainScore / maxPossibleScore,
            price: priceScore / maxPossibleScore,
            traffic: trafficScore / maxPossibleScore,
            seller: sellerScore / maxPossibleScore,
            category: categoryScore / maxPossibleScore,
            market: marketScore / maxPossibleScore,
          },
          details: {
            domainLength: criteria.domainLength?.weight,
            domainExtension: criteria.domainExtension?.weight,
            domainKeywords: criteria.domainKeywords?.weight,
            priceRange: criteria.priceRange?.weight,
            priceNegotiability: criteria.priceNegotiability?.weight,
            trafficRange: criteria.trafficRange?.weight,
            trafficGrowth: criteria.trafficGrowth?.weight,
            sellerPortfolioSize: criteria.sellerPortfolioSize?.weight,
            sellerResponseTime: criteria.sellerResponseTime?.weight,
            sellerRating: criteria.sellerRating?.weight,
            categoryMatch: criteria.categoryMatch?.weight,
            categoryExclusion: criteria.categoryExclusion?.weight,
            marketDemand: criteria.marketDemand?.weight,
            marketCompetition: criteria.marketCompetition?.weight,
          },
          recommendations: [],
        };

        // Generate recommendations
        score.recommendations = generateRecommendations(score);

        // Apply auto-qualification if configured
        if (config.autoQualify && normalizedTotalScore >= config.autoQualify.minScore) {
          lead.status = config.autoQualify.status;
        }

        return score;
      },
    ]
  );
} 