import { NotificationService } from "../notification-service";
import { NotificationConfig, NotificationPayload } from "../types";
import { UnifiedLead } from "../../../../processors/types";

describe("NotificationService", () => {
  const testLead: UnifiedLead = {
    source: "sedo",
    name: "test.com",
    price: "$500",
    category: "Technology",
    traffic: "1000",
    seller: {
      name: "John Doe",
      email: "john@example.com",
      portfolioSize: 15,
    },
    metadata: {},
  };

  const testConfig: NotificationConfig = {
    email: {
      smtpHost: "smtp.example.com",
      smtpPort: 587,
      smtpUser: "test@example.com",
      smtpPass: "password",
      fromEmail: "noreply@example.com",
      toEmail: "alerts@example.com",
    },
    slack: {
      webhookUrl: "https://hooks.slack.com/services/test",
      channel: "#leads",
      username: "Lead Manager",
    },
    webhook: {
      url: "https://api.example.com/webhook",
      headers: {
        "Authorization": "Bearer test-token",
      },
    },
  };

  const testPayload: NotificationPayload = {
    type: "lead_created",
    lead: testLead,
    timestamp: new Date().toISOString(),
  };

  it("should send email notification", async () => {
    const service = new NotificationService(testConfig);
    const result = await service.sendEmail(testPayload);

    expect(result).toBeDefined();
    expect(result.success).toBe(true);
    expect(result.type).toBe("email");
  });

  it("should send Slack notification", async () => {
    const service = new NotificationService(testConfig);
    const result = await service.sendSlack(testPayload);

    expect(result).toBeDefined();
    expect(result.success).toBe(true);
    expect(result.type).toBe("slack");
  });

  it("should send webhook notification", async () => {
    const service = new NotificationService(testConfig);
    const result = await service.sendWebhook(testPayload);

    expect(result).toBeDefined();
    expect(result.success).toBe(true);
    expect(result.type).toBe("webhook");
  });

  it("should handle missing email configuration", async () => {
    const service = new NotificationService({});
    const result = await service.sendEmail(testPayload);

    expect(result).toBeDefined();
    expect(result.success).toBe(false);
    expect(result.type).toBe("email");
    expect(result.error).toBe("Email configuration not provided");
  });

  it("should handle missing Slack configuration", async () => {
    const service = new NotificationService({});
    const result = await service.sendSlack(testPayload);

    expect(result).toBeDefined();
    expect(result.success).toBe(false);
    expect(result.type).toBe("slack");
    expect(result.error).toBe("Slack configuration not provided");
  });

  it("should handle missing webhook configuration", async () => {
    const service = new NotificationService({});
    const result = await service.sendWebhook(testPayload);

    expect(result).toBeDefined();
    expect(result.success).toBe(false);
    expect(result.type).toBe("webhook");
    expect(result.error).toBe("Webhook configuration not provided");
  });

  it("should format different notification types correctly", async () => {
    const service = new NotificationService(testConfig);

    // Test lead created notification
    const createdPayload = { ...testPayload, type: "lead_created" as const };
    const createdResult = await service.sendEmail(createdPayload);
    expect(createdResult.success).toBe(true);

    // Test lead updated notification
    const updatedPayload = { ...testPayload, type: "lead_updated" as const };
    const updatedResult = await service.sendEmail(updatedPayload);
    expect(updatedResult.success).toBe(true);

    // Test status changed notification
    const statusPayload = {
      ...testPayload,
      type: "lead_status_changed" as const,
      status: "qualified",
    };
    const statusResult = await service.sendEmail(statusPayload);
    expect(statusResult.success).toBe(true);

    // Test interaction added notification
    const interactionPayload = {
      ...testPayload,
      type: "interaction_added" as const,
      interaction: {
        type: "email",
        content: "Initial contact made",
      },
    };
    const interactionResult = await service.sendEmail(interactionPayload);
    expect(interactionResult.success).toBe(true);
  });
}); 