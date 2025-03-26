import { createProcessorAgent } from "../../factory";
import { DatabaseMCPServer } from "../../mcp/database/base";
import {
  UnifiedLead,
  LeadProcessorConfig,
  LeadProcessorResult,
  DomainSource,
} from "./types";
import { SedoDomain } from "../scrapers/sedo/types";
import { OpenSeaDomain } from "../scrapers/opensea/types";
import { GoDaddyDomain } from "../scrapers/godaddy/types";

function normalizeSedoDomain(domain: SedoDomain): UnifiedLead {
  return {
    source: "sedo",
    name: domain.name,
    price: domain.price,
    category: domain.category,
    traffic: domain.traffic,
    seller: {
      name: domain.seller.name,
      email: domain.seller.email,
      portfolioSize: domain.seller.portfolioSize,
    },
    metadata: {},
  };
}

function normalizeOpenSeaDomain(domain: OpenSeaDomain): UnifiedLead {
  return {
    source: "opensea",
    name: domain.name,
    price: domain.price,
    category: domain.traits.find(t => t.name === "Category")?.value || "Uncategorized",
    seller: {
      name: domain.seller.username || domain.seller.address,
      address: domain.seller.address,
      portfolioSize: domain.seller.portfolioSize,
    },
    metadata: {
      chain: domain.chain,
      traits: domain.traits,
      lastSale: domain.lastSale,
    },
  };
}

function normalizeGoDaddyDomain(domain: GoDaddyDomain): UnifiedLead {
  return {
    source: "godaddy",
    name: domain.name,
    price: domain.price,
    category: domain.category,
    traffic: domain.traffic,
    seller: {
      name: domain.seller.name,
      email: domain.seller.email,
      portfolioSize: domain.seller.portfolioSize,
    },
    metadata: {
      auctionEndDate: domain.auctionEndDate,
      bids: domain.bids,
      reservePrice: domain.reservePrice,
    },
  };
}

function filterLead(lead: UnifiedLead, config: LeadProcessorConfig): boolean {
  // Filter by portfolio size
  if (config.minPortfolioSize && (!lead.seller.portfolioSize || lead.seller.portfolioSize < config.minPortfolioSize)) {
    return false;
  }

  // Filter by price
  const price = parseFloat(lead.price.replace(/[^0-9.]/g, ""));
  if (config.minPrice && price < config.minPrice) {
    return false;
  }
  if (config.maxPrice && price > config.maxPrice) {
    return false;
  }

  // Filter by categories
  if (config.categories && config.categories.length > 0 && !config.categories.includes(lead.category)) {
    return false;
  }
  if (config.excludeCategories && config.excludeCategories.includes(lead.category)) {
    return false;
  }

  return true;
}

export function createLeadProcessor(config: LeadProcessorConfig = {}) {
  const database = new DatabaseMCPServer();

  return createProcessorAgent(
    "LeadProcessor",
    "Processes and normalizes leads from different sources",
    [
      async (input: { sedo?: SedoDomain[]; opensea?: OpenSeaDomain[]; godaddy?: GoDaddyDomain[] }) => {
        await database.initialize();
        try {
          const leads: UnifiedLead[] = [];
          let totalProcessed = 0;

          // Process Sedo domains
          if (input.sedo) {
            totalProcessed += input.sedo.length;
            leads.push(...input.sedo.map(normalizeSedoDomain));
          }

          // Process OpenSea domains
          if (input.opensea) {
            totalProcessed += input.opensea.length;
            leads.push(...input.opensea.map(normalizeOpenSeaDomain));
          }

          // Process GoDaddy domains
          if (input.godaddy) {
            totalProcessed += input.godaddy.length;
            leads.push(...input.godaddy.map(normalizeGoDaddyDomain));
          }

          // Filter leads based on configuration
          const filteredLeads = leads.filter(lead => filterLead(lead, config));
          const totalFiltered = totalProcessed - filteredLeads.length;

          // Store leads in database
          for (const lead of filteredLeads) {
            await database.execute(
              `INSERT INTO leads (source, name, price, category, traffic, seller_name, seller_email, seller_address, seller_username, seller_portfolio_size, metadata, created_at, updated_at)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
              [
                lead.source,
                lead.name,
                lead.price,
                lead.category,
                lead.traffic,
                lead.seller.name,
                lead.seller.email,
                lead.seller.address,
                lead.seller.username,
                lead.seller.portfolioSize,
                JSON.stringify(lead.metadata),
              ]
            );
          }

          const result: LeadProcessorResult = {
            leads: filteredLeads,
            totalProcessed,
            totalFiltered,
            timestamp: new Date().toISOString(),
          };

          return result;
        } finally {
          await database.cleanup();
        }
      },
    ]
  );
} 