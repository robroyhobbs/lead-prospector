import { createManagerAgent } from "../../factory";
import { DatabaseMCPServer } from "../../mcp/database/base";
import {
  LeadStatus,
  LeadInteraction,
  LeadManagementConfig,
  LeadManagementResult,
} from "./types";
import { UnifiedLead } from "../processors/types";

function shouldAutoQualify(lead: UnifiedLead, config: LeadManagementConfig): boolean {
  if (!config.autoQualify) return false;

  const { minPortfolioSize, minPrice, maxPrice, categories } = config.autoQualify;

  // Check portfolio size
  if (minPortfolioSize && (!lead.seller.portfolioSize || lead.seller.portfolioSize < minPortfolioSize)) {
    return false;
  }

  // Check price
  const price = parseFloat(lead.price.replace(/[^0-9.]/g, ""));
  if (minPrice && price < minPrice) return false;
  if (maxPrice && price > maxPrice) return false;

  // Check categories
  if (categories && categories.length > 0 && !categories.includes(lead.category)) {
    return false;
  }

  return true;
}

async function sendNotification(
  lead: UnifiedLead,
  status: LeadStatus,
  config: LeadManagementConfig
) {
  const { notificationSettings } = config;
  if (!notificationSettings) return;

  // TODO: Implement notification sending logic
  console.log(`Notification for lead ${lead.name}: Status changed to ${status}`);
}

export function createLeadManager(config: LeadManagementConfig = {}) {
  const database = new DatabaseMCPServer();

  return createManagerAgent(
    "LeadManager",
    "Manages leads and their interactions",
    [
      async (input: { lead: UnifiedLead; action: "create" | "update" | "interact" }) => {
        await database.initialize();
        try {
          const { lead, action } = input;
          let status: LeadStatus = "new";
          let interactions: LeadInteraction[] = [];

          if (action === "create") {
            // Auto-qualify if configured
            if (shouldAutoQualify(lead, config)) {
              status = "qualified";
            } else {
              status = config.defaultStatus || "new";
            }

            // Store lead in database
            const result = await database.execute(
              `INSERT INTO leads (source, name, price, category, traffic, seller_name, seller_email, seller_address, seller_username, seller_portfolio_size, metadata, status, created_at, updated_at)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
               RETURNING id`,
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
                status,
              ]
            );

            lead.id = result.rows[0].id;

            // Send notification for new lead
            await sendNotification(lead, status, config);
          } else if (action === "update") {
            // Update lead status
            const result = await database.execute(
              `UPDATE leads SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? RETURNING status`,
              [input.lead.status, input.lead.id]
            );

            status = result.rows[0].status;
          } else if (action === "interact") {
            // Add interaction
            const interaction = input.lead as unknown as LeadInteraction;
            const result = await database.execute(
              `INSERT INTO lead_interactions (lead_id, type, content, status, created_at)
               VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
               RETURNING id`,
              [interaction.lead_id, interaction.type, interaction.content, interaction.status]
            );

            interaction.id = result.rows[0].id;
            interactions = [interaction];

            // Update lead status based on interaction
            status = interaction.status;
            await database.execute(
              `UPDATE leads SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
              [status, interaction.lead_id]
            );

            // Send notification for status change
            await sendNotification(lead, status, config);
          }

          // Get all interactions for the lead
          const interactionsResult = await database.execute(
            `SELECT * FROM lead_interactions WHERE lead_id = ? ORDER BY created_at DESC`,
            [lead.id]
          );
          interactions = interactionsResult.rows;

          const result: LeadManagementResult = {
            lead,
            status,
            interactions,
            lastUpdated: new Date().toISOString(),
          };

          return result;
        } finally {
          await database.cleanup();
        }
      },
    ]
  );
} 