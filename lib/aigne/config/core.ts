import { AIAgent, OpenAIChatModel, ExecutionEngine } from "@aigne/core";

// Environment variables
const GROQ_API_KEY = process.env.GROQ_API_KEY;
const DEFAULT_CHAT_MODEL = "mixtral-8x7b-32768"; // Using Mixtral for better performance

if (!GROQ_API_KEY) {
  throw new Error("GROQ_API_KEY environment variable is required");
}

// Initialize the chat model
export const model = new OpenAIChatModel({
  apiKey: GROQ_API_KEY,
  model: DEFAULT_CHAT_MODEL,
});

// Initialize the execution engine
export const engine = new ExecutionEngine({ model });

// Base agent configuration
export const baseAgentConfig = {
  model,
  temperature: 0.7,
  maxTokens: 4096,
};

// Export types for reuse
export type AgentConfig = typeof baseAgentConfig;
export type Agent = AIAgent; 