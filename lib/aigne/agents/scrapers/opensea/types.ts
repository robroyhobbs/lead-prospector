export interface OpenSeaDomain {
  name: string;
  price: string;
  chain: string;
  seller: {
    address: string;
    username?: string;
    portfolioSize?: number;
  };
  traits: {
    name: string;
    value: string;
  }[];
  lastSale?: {
    price: string;
    date: string;
  };
}

export interface OpenSeaScraperConfig {
  baseUrl: string;
  maxPages?: number;
  chains?: string[];
  minPrice?: number;
  maxPrice?: number;
  traits?: {
    name: string;
    value: string;
  }[];
}

export interface OpenSeaScraperResult {
  domains: OpenSeaDomain[];
  totalFound: number;
  timestamp: string;
} 