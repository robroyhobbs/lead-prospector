import nodemailer from "nodemailer";
import { WebClient } from "@slack/web-api";
import axios from "axios";
import {
  NotificationConfig,
  NotificationPayload,
  NotificationResult,
  NotificationType,
} from "./types";

export class NotificationService {
  private config: NotificationConfig;
  private slackClient?: WebClient;

  constructor(config: NotificationConfig) {
    this.config = config;
    if (config.slack?.webhookUrl) {
      this.slackClient = new WebClient(config.slack.webhookUrl);
    }
  }

  async sendEmail(payload: NotificationPayload): Promise<NotificationResult> {
    if (!this.config.email) {
      return { success: false, type: "email", error: "Email configuration not provided" };
    }

    try {
      const transporter = nodemailer.createTransport({
        host: this.config.email.smtpHost,
        port: this.config.email.smtpPort,
        secure: true,
        auth: {
          user: this.config.email.smtpUser,
          pass: this.config.email.smtpPass,
        },
      });

      const subject = this.getEmailSubject(payload);
      const html = this.getEmailBody(payload);

      await transporter.sendMail({
        from: this.config.email.fromEmail,
        to: this.config.email.toEmail,
        subject,
        html,
      });

      return { success: true, type: "email" };
    } catch (error) {
      return {
        success: false,
        type: "email",
        error: error instanceof Error ? error.message : "Failed to send email",
      };
    }
  }

  async sendSlack(payload: NotificationPayload): Promise<NotificationResult> {
    if (!this.config.slack?.webhookUrl) {
      return { success: false, type: "slack", error: "Slack configuration not provided" };
    }

    try {
      const message = this.getSlackMessage(payload);
      await this.slackClient?.chat.postMessage({
        channel: this.config.slack.channel || "#leads",
        text: message,
        username: this.config.slack.username || "Lead Manager",
      });

      return { success: true, type: "slack" };
    } catch (error) {
      return {
        success: false,
        type: "slack",
        error: error instanceof Error ? error.message : "Failed to send Slack message",
      };
    }
  }

  async sendWebhook(payload: NotificationPayload): Promise<NotificationResult> {
    if (!this.config.webhook?.url) {
      return { success: false, type: "webhook", error: "Webhook configuration not provided" };
    }

    try {
      await axios.post(this.config.webhook.url, payload, {
        headers: {
          "Content-Type": "application/json",
          ...this.config.webhook.headers,
        },
      });

      return { success: true, type: "webhook" };
    } catch (error) {
      return {
        success: false,
        type: "webhook",
        error: error instanceof Error ? error.message : "Failed to send webhook",
      };
    }
  }

  private getEmailSubject(payload: NotificationPayload): string {
    const { type, lead } = payload;
    switch (type) {
      case "lead_created":
        return `New Lead: ${lead.name}`;
      case "lead_updated":
        return `Lead Updated: ${lead.name}`;
      case "lead_status_changed":
        return `Lead Status Changed: ${lead.name} - ${payload.status}`;
      case "interaction_added":
        return `New Interaction: ${lead.name} - ${payload.interaction?.type}`;
      default:
        return `Lead Notification: ${lead.name}`;
    }
  }

  private getEmailBody(payload: NotificationPayload): string {
    const { type, lead, status, interaction } = payload;
    let content = `
      <h2>Lead Details</h2>
      <p><strong>Name:</strong> ${lead.name}</p>
      <p><strong>Source:</strong> ${lead.source}</p>
      <p><strong>Price:</strong> ${lead.price}</p>
      <p><strong>Category:</strong> ${lead.category}</p>
      <p><strong>Seller:</strong> ${lead.seller.name}</p>
    `;

    switch (type) {
      case "lead_created":
        content += "<h3>New Lead Created</h3>";
        break;
      case "lead_updated":
        content += "<h3>Lead Updated</h3>";
        break;
      case "lead_status_changed":
        content += `<h3>Status Changed to: ${status}</h3>`;
        break;
      case "interaction_added":
        content += `
          <h3>New Interaction Added</h3>
          <p><strong>Type:</strong> ${interaction?.type}</p>
          <p><strong>Content:</strong> ${interaction?.content}</p>
        `;
        break;
    }

    return content;
  }

  private getSlackMessage(payload: NotificationPayload): string {
    const { type, lead, status, interaction } = payload;
    let message = `*Lead: ${lead.name}*\n`;
    message += `Source: ${lead.source}\n`;
    message += `Price: ${lead.price}\n`;
    message += `Category: ${lead.category}\n`;
    message += `Seller: ${lead.seller.name}\n\n`;

    switch (type) {
      case "lead_created":
        message += "🎯 New Lead Created";
        break;
      case "lead_updated":
        message += "📝 Lead Updated";
        break;
      case "lead_status_changed":
        message += `🔄 Status Changed to: ${status}`;
        break;
      case "interaction_added":
        message += `💬 New ${interaction?.type} Interaction\n${interaction?.content}`;
        break;
    }

    return message;
  }
} 