import { UnifiedLead } from "../../../processors/types";
import { LeadStatus } from "../types";

export type NotificationType = "email" | "slack" | "webhook";

export interface NotificationConfig {
  email?: {
    smtpHost: string;
    smtpPort: number;
    smtpUser: string;
    smtpPass: string;
    fromEmail: string;
    toEmail: string;
  };
  slack?: {
    webhookUrl: string;
    channel?: string;
    username?: string;
  };
  webhook?: {
    url: string;
    headers?: Record<string, string>;
  };
}

export interface NotificationPayload {
  type: "lead_created" | "lead_updated" | "lead_status_changed" | "interaction_added";
  lead: UnifiedLead;
  status?: LeadStatus;
  interaction?: {
    type: string;
    content: string;
  };
  timestamp: string;
}

export interface NotificationResult {
  success: boolean;
  type: NotificationType;
  error?: string;
} 