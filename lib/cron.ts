// Cron job for scheduling agent runs

import { runAllAgents, getAgentStatuses } from "./aigne/runner"

// This would be called by a Replit cron job
export async function scheduledAgentRun() {
  console.log("Running scheduled agent job at", new Date().toISOString())

  try {
    // Get current agent statuses
    const statuses = getAgentStatuses()

    // Only run agents that are active
    const activeAgents = statuses.filter((status) => status.status === "active")

    if (activeAgents.length === 0) {
      console.log("No active agents to run")
      return
    }

    console.log(`Running ${activeAgents.length} active agents...`)

    // Run all active agents
    const results = await runAllAgents()

    // Log results
    console.log("Agent run results:", results)

    // Return results
    return {
      success: true,
      agentsRun: results.length,
      leadsFound: results.reduce((total, result) => total + result.leadsFound, 0),
      timestamp: new Date().toISOString(),
    }
  } catch (error) {
    console.error("Error running scheduled agents:", error)

    return {
      success: false,
      error: error.message,
      timestamp: new Date().toISOString(),
    }
  }
}

