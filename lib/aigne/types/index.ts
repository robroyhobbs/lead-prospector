import { Page } from "puppeteer";

export interface MCPServer {
  initialize(): Promise<void>;
  cleanup(): Promise<void>;
}

export interface Workflow {
  name: string;
  description: string;
  engine: any;
  agents: any[];
  type: "sequential" | "concurrent" | "router";
}

export interface Agent {
  name: string;
  instructions: string;
  outputKey: string;
  tools: any[];
  model: any;
  temperature: number;
  maxTokens: number;
  execute(): Promise<any>;
}

export interface ScrapingOptions {
  waitForSelector?: string;
  timeout?: number;
  evaluate?: (page: Page) => Promise<any>;
}

export interface Lead {
  id?: number;
  source: string;
  name?: string;
  email?: string;
  portfolio_size?: number;
  domain_categories?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Interaction {
  id?: number;
  lead_id: number;
  type: string;
  notes?: string;
  created_at?: string;
} 