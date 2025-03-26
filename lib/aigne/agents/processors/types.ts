import { SedoDomain } from "../scrapers/sedo/types";
import { OpenSeaDomain } from "../scrapers/opensea/types";
import { GoDaddyDomain } from "../scrapers/godaddy/types";

export type DomainSource = "sedo" | "opensea" | "godaddy";

export interface UnifiedLead {
  id?: number;
  source: DomainSource;
  name: string;
  price: string;
  category: string;
  traffic?: string;
  seller: {
    name: string;
    email?: string;
    address?: string;
    username?: string;
    portfolioSize?: number;
  };
  metadata: {
    chain?: string;
    traits?: { name: string; value: string }[];
    lastSale?: { price: string; date: string };
    auctionEndDate?: string;
    bids?: number;
    reservePrice?: string;
  };
  created_at?: string;
  updated_at?: string;
}

export interface LeadProcessorConfig {
  minPortfolioSize?: number;
  minPrice?: number;
  maxPrice?: number;
  categories?: string[];
  excludeCategories?: string[];
}

export interface LeadProcessorResult {
  leads: UnifiedLead[];
  totalProcessed: number;
  totalFiltered: number;
  timestamp: string;
} 