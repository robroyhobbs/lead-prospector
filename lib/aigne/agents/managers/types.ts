import { UnifiedLead } from "../../processors/types";

export type LeadStatus = "new" | "contacted" | "qualified" | "negotiating" | "closed" | "rejected";

export interface LeadInteraction {
  id?: number;
  lead_id: number;
  type: "email" | "call" | "meeting" | "note";
  content: string;
  status: LeadStatus;
  created_at?: string;
}

export interface LeadManagementConfig {
  defaultStatus?: LeadStatus;
  autoQualify?: {
    minPortfolioSize?: number;
    minPrice?: number;
    maxPrice?: number;
    categories?: string[];
  };
  notificationSettings?: {
    email?: boolean;
    slack?: boolean;
    webhook?: string;
  };
}

export interface LeadManagementResult {
  lead: UnifiedLead;
  status: LeadStatus;
  interactions: LeadInteraction[];
  lastUpdated: string;
} 