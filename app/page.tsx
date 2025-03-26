import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import LeadTable from "@/components/lead-table"
import DashboardStats from "@/components/dashboard-stats"
import AgentStatus from "@/components/agent-status"
import RecentAgentRuns from "@/components/recent-agent-runs"
import Link from "next/link"

export default function Dashboard() {
  return (
    <main className="container mx-auto p-4 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Domain Prospector</h1>
          <p className="text-muted-foreground">AI-powered lead generation and management</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/agents">Manage Agents</Link>
          </Button>
          <Button asChild>
            <Link href="/leads/add">Add Lead</Link>
          </Button>
        </div>
      </div>

      <DashboardStats />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Lead Management</CardTitle>
              <CardDescription>View and manage potential leads for your domain business</CardDescription>
            </CardHeader>
            <CardContent>
              <LeadTable />
            </CardContent>
          </Card>
        </div>
        <div className="space-y-6">
          <AgentStatus />
          <RecentAgentRuns />
        </div>
      </div>
    </main>
  )
}

