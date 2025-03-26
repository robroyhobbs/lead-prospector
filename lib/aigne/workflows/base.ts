import { Workflow, Agent } from "../types";
import { engine } from "../config/core";

export interface WorkflowConfig {
  name: string;
  description: string;
  agents: Agent[];
  type?: "sequential" | "concurrent" | "router";
}

export function createWorkflow(config: WorkflowConfig): Workflow {
  return {
    name: config.name,
    description: config.description,
    engine,
    agents: config.agents,
    type: config.type || "sequential",
  };
}

// Helper function to create a sequential workflow
export function createSequentialWorkflow(config: Omit<WorkflowConfig, "type">): Workflow {
  return createWorkflow({
    ...config,
    type: "sequential",
  });
}

// Helper function to create a concurrent workflow
export function createConcurrentWorkflow(config: Omit<WorkflowConfig, "type">): Workflow {
  return createWorkflow({
    ...config,
    type: "concurrent",
  });
}

// Helper function to create a router workflow
export function createRouterWorkflow(config: Omit<WorkflowConfig, "type">): Workflow {
  return createWorkflow({
    ...config,
    type: "router",
  });
} 