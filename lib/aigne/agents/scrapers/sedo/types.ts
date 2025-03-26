export interface SedoDomain {
  name: string;
  price: string;
  category: string;
  traffic: string;
  seller: {
    name: string;
    email?: string;
    portfolioSize?: number;
  };
}

export interface SedoScraperConfig {
  baseUrl: string;
  maxPages?: number;
  categories?: string[];
  minPrice?: number;
  maxPrice?: number;
}

export interface SedoScraperResult {
  domains: SedoDomain[];
  totalFound: number;
  timestamp: string;
} 