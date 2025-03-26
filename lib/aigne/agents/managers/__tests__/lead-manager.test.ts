import { createLeadManager } from "../lead-manager";
import { LeadManagementConfig, LeadInteraction } from "../types";
import { UnifiedLead } from "../../processors/types";

describe("LeadManager", () => {
  const testLead: UnifiedLead = {
    source: "sedo",
    name: "test.com",
    price: "$500",
    category: "Technology",
    traffic: "1000",
    seller: {
      name: "John Doe",
      email: "john@example.com",
      portfolioSize: 15,
    },
    metadata: {},
  };

  const config: LeadManagementConfig = {
    defaultStatus: "new",
    autoQualify: {
      minPortfolioSize: 10,
      minPrice: 100,
      maxPrice: 1000,
      categories: ["Technology"],
    },
    notificationSettings: {
      email: true,
    },
  };

  it("should create a new lead with auto-qualification", async () => {
    const manager = createLeadManager(config);
    const result = await manager.execute({
      lead: testLead,
      action: "create",
    });

    expect(result).toBeDefined();
    expect(result.lead).toBeDefined();
    expect(result.lead.id).toBeDefined();
    expect(result.status).toBe("qualified"); // Should auto-qualify based on config
    expect(result.interactions).toHaveLength(0);
    expect(result.lastUpdated).toBeDefined();
  });

  it("should update lead status", async () => {
    const manager = createLeadManager(config);
    const lead = { ...testLead, id: 1, status: "contacted" };
    const result = await manager.execute({
      lead,
      action: "update",
    });

    expect(result).toBeDefined();
    expect(result.status).toBe("contacted");
  });

  it("should add interaction and update status", async () => {
    const manager = createLeadManager(config);
    const interaction: LeadInteraction = {
      lead_id: 1,
      type: "email",
      content: "Initial contact made",
      status: "contacted",
    };

    const result = await manager.execute({
      lead: interaction as unknown as UnifiedLead,
      action: "interact",
    });

    expect(result).toBeDefined();
    expect(result.interactions).toHaveLength(1);
    expect(result.interactions[0].id).toBeDefined();
    expect(result.status).toBe("contacted");
  });

  it("should not auto-qualify lead that doesn't meet criteria", async () => {
    const lowValueLead = {
      ...testLead,
      price: "$50",
      seller: {
        ...testLead.seller,
        portfolioSize: 5,
      },
    };

    const manager = createLeadManager(config);
    const result = await manager.execute({
      lead: lowValueLead,
      action: "create",
    });

    expect(result).toBeDefined();
    expect(result.status).toBe("new"); // Should not auto-qualify
  });
}); 