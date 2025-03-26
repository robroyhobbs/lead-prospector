import { createSequentialWorkflow } from "./base";
import { createSedoScraper } from "../agents/scrapers/sedo/scraper";
import { createOpenSeaScraper } from "../agents/scrapers/opensea/scraper";
import { createGoDaddyScraper } from "../agents/scrapers/godaddy/scraper";
import { createLeadProcessor } from "../agents/processors/lead-processor";
import { createLeadManager } from "../agents/managers/lead-manager";
import { LeadProcessorConfig } from "../agents/processors/types";
import { LeadManagementConfig } from "../agents/managers/types";

const SEDO_BASE_URL = "https://sedo.com/search/searchresult.php4";
const OPENSEA_BASE_URL = "https://opensea.io/assets";
const GODADDY_BASE_URL = "https://www.godaddy.com/domain-value-appraisal/auctions";

export interface LeadGenerationConfig {
  sedo?: {
    baseUrl?: string;
    maxPages?: number;
    categories?: string[];
    minPrice?: number;
    maxPrice?: number;
  };
  opensea?: {
    baseUrl?: string;
    maxPages?: number;
    chains?: string[];
    minPrice?: number;
    maxPrice?: number;
    traits?: { name: string; value: string }[];
  };
  godaddy?: {
    baseUrl?: string;
    maxPages?: number;
    categories?: string[];
    minPrice?: number;
    maxPrice?: number;
    auctionOnly?: boolean;
    endingSoon?: boolean;
  };
  processor?: LeadProcessorConfig;
  manager?: LeadManagementConfig;
}

export function createLeadGenerationWorkflow(config: LeadGenerationConfig = {}) {
  const sedoScraper = createSedoScraper({
    baseUrl: config.sedo?.baseUrl || SEDO_BASE_URL,
    ...config.sedo,
  });
  const openseaScraper = createOpenSeaScraper({
    baseUrl: config.opensea?.baseUrl || OPENSEA_BASE_URL,
    ...config.opensea,
  });
  const godaddyScraper = createGoDaddyScraper({
    baseUrl: config.godaddy?.baseUrl || GODADDY_BASE_URL,
    ...config.godaddy,
  });
  const leadProcessor = createLeadProcessor(config.processor);
  const leadManager = createLeadManager(config.manager);

  return createSequentialWorkflow({
    name: "LeadGeneration",
    description: "Generates leads from multiple domain marketplaces",
    agents: [
      sedoScraper,
      openseaScraper,
      godaddyScraper,
      leadProcessor,
      leadManager,
    ],
  });
} 