import { AIAgent } from "@aigne/core";
import { baseAgentConfig } from "../config/core";

interface AgentFactoryOptions {
  name: string;
  instructions: string;
  outputKey: string;
  tools?: any[];
}

export function createAgent({ name, instructions, outputKey, tools = [] }: AgentFactoryOptions): AIAgent {
  return AIAgent.from({
    name,
    instructions,
    outputKey,
    tools,
    ...baseAgentConfig,
  });
}

// Helper function to create a scraper agent
export function createScraperAgent(name: string, instructions: string, tools: any[]): AIAgent {
  return createAgent({
    name,
    instructions,
    outputKey: "scrapedData",
    tools,
  });
}

// Helper function to create a processor agent
export function createProcessorAgent(name: string, instructions: string, tools: any[]): AIAgent {
  return createAgent({
    name,
    instructions,
    outputKey: "processedData",
    tools,
  });
}

// Helper function to create a manager agent
export function createManagerAgent(name: string, instructions: string, tools: any[]): AIAgent {
  return createAgent({
    name,
    instructions,
    outputKey: "managedData",
    tools,
  });
} 