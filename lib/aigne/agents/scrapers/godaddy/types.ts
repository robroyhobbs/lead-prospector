export interface GoDaddyDomain {
  name: string;
  price: string;
  category: string;
  traffic: string;
  seller: {
    name: string;
    email?: string;
    portfolioSize?: number;
  };
  auctionEndDate?: string;
  bids?: number;
  reservePrice?: string;
}

export interface GoDaddyScraperConfig {
  baseUrl: string;
  maxPages?: number;
  categories?: string[];
  minPrice?: number;
  maxPrice?: number;
  auctionOnly?: boolean;
  endingSoon?: boolean;
}

export interface GoDaddyScraperResult {
  domains: GoDaddyDomain[];
  totalFound: number;
  timestamp: string;
} 