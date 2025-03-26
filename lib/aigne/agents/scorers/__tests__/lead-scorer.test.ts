import { createLeadScorer } from "../lead-scorer";
import { LeadScorerConfig } from "../types";
import { UnifiedLead } from "../../../../processors/types";

describe("LeadScorer", () => {
  const testLead: UnifiedLead = {
    source: "sedo",
    name: "techstartup.com",
    price: "$5000",
    category: "Technology",
    traffic: "10000",
    seller: {
      name: "John Doe",
      email: "john@example.com",
      portfolioSize: 20,
    },
    metadata: {
      priceNegotiable: true,
      trafficGrowing: true,
      sellerResponseTime: 12,
      sellerRating: 4.8,
      marketDemand: 0.8,
      marketCompetition: 0.2,
    },
  };

  const config: LeadScorerConfig = {
    criteria: {
      domainLength: {
        min: 5,
        max: 15,
        weight: 2,
      },
      domainExtension: {
        preferred: ["com", "net", "org"],
        weight: 1,
      },
      domainKeywords: {
        keywords: ["tech", "startup", "app"],
        weight: 2,
      },
      priceRange: {
        min: 1000,
        max: 10000,
        weight: 3,
      },
      priceNegotiability: {
        weight: 1,
      },
      trafficRange: {
        min: 5000,
        max: 50000,
        weight: 2,
      },
      trafficGrowth: {
        weight: 1,
      },
      sellerPortfolioSize: {
        min: 10,
        max: 50,
        weight: 1,
      },
      sellerResponseTime: {
        weight: 1,
      },
      sellerRating: {
        weight: 1,
      },
      categoryMatch: {
        preferred: ["Technology", "Business", "Finance"],
        weight: 2,
      },
      categoryExclusion: {
        excluded: ["Adult", "Gambling"],
        weight: 1,
      },
      marketDemand: {
        weight: 2,
      },
      marketCompetition: {
        weight: 1,
      },
    },
    autoQualify: {
      minScore: 0.7,
      status: "qualified",
    },
  };

  it("should calculate domain score correctly", async () => {
    const scorer = createLeadScorer(config);
    const score = await scorer.execute({ lead: testLead });

    expect(score).toBeDefined();
    expect(score.categoryScores.domain).toBeGreaterThan(0);
    expect(score.details.domainLength).toBe(2);
    expect(score.details.domainExtension).toBe(1);
    expect(score.details.domainKeywords).toBe(2);
  });

  it("should calculate price score correctly", async () => {
    const scorer = createLeadScorer(config);
    const score = await scorer.execute({ lead: testLead });

    expect(score).toBeDefined();
    expect(score.categoryScores.price).toBeGreaterThan(0);
    expect(score.details.priceRange).toBe(3);
    expect(score.details.priceNegotiability).toBe(1);
  });

  it("should calculate traffic score correctly", async () => {
    const scorer = createLeadScorer(config);
    const score = await scorer.execute({ lead: testLead });

    expect(score).toBeDefined();
    expect(score.categoryScores.traffic).toBeGreaterThan(0);
    expect(score.details.trafficRange).toBe(2);
    expect(score.details.trafficGrowth).toBe(1);
  });

  it("should calculate seller score correctly", async () => {
    const scorer = createLeadScorer(config);
    const score = await scorer.execute({ lead: testLead });

    expect(score).toBeDefined();
    expect(score.categoryScores.seller).toBeGreaterThan(0);
    expect(score.details.sellerPortfolioSize).toBe(1);
    expect(score.details.sellerResponseTime).toBe(1);
    expect(score.details.sellerRating).toBe(1);
  });

  it("should calculate category score correctly", async () => {
    const scorer = createLeadScorer(config);
    const score = await scorer.execute({ lead: testLead });

    expect(score).toBeDefined();
    expect(score.categoryScores.category).toBeGreaterThan(0);
    expect(score.details.categoryMatch).toBe(2);
    expect(score.details.categoryExclusion).toBe(1);
  });

  it("should calculate market score correctly", async () => {
    const scorer = createLeadScorer(config);
    const score = await scorer.execute({ lead: testLead });

    expect(score).toBeDefined();
    expect(score.categoryScores.market).toBeGreaterThan(0);
    expect(score.details.marketDemand).toBe(2);
    expect(score.details.marketCompetition).toBe(1);
  });

  it("should generate recommendations based on low scores", async () => {
    const lowScoreLead = {
      ...testLead,
      name: "longdomainname123.com",
      price: "$100",
      traffic: "100",
      seller: {
        ...testLead.seller,
        portfolioSize: 5,
      },
      category: "Other",
      metadata: {
        ...testLead.metadata,
        marketDemand: 0.3,
        marketCompetition: 0.8,
      },
    };

    const scorer = createLeadScorer(config);
    const score = await scorer.execute({ lead: lowScoreLead });

    expect(score.recommendations).toContain("Consider domain name optimization for better marketability");
    expect(score.recommendations).toContain("Price may be outside optimal range for this market");
    expect(score.recommendations).toContain("Traffic levels may need improvement for better ROI");
    expect(score.recommendations).toContain("Seller profile may indicate slower response times");
    expect(score.recommendations).toContain("Category may not align with target market");
    expect(score.recommendations).toContain("Market conditions may not be optimal for this domain");
  });

  it("should auto-qualify leads with high scores", async () => {
    const scorer = createLeadScorer(config);
    const score = await scorer.execute({ lead: testLead });

    expect(score.totalScore).toBeGreaterThanOrEqual(0.7);
    expect(testLead.status).toBe("qualified");
  });

  it("should normalize scores to 0-1 range", async () => {
    const scorer = createLeadScorer(config);
    const score = await scorer.execute({ lead: testLead });

    expect(score.totalScore).toBeLessThanOrEqual(1);
    expect(score.totalScore).toBeGreaterThanOrEqual(0);
    Object.values(score.categoryScores).forEach(categoryScore => {
      expect(categoryScore).toBeLessThanOrEqual(1);
      expect(categoryScore).toBeGreaterThanOrEqual(0);
    });
  });
}); 