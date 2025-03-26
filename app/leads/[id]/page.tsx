import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Mail, Phone, Globe, Calendar, MessageSquare } from "lucide-react"
import Link from "next/link"
import { LeadRepository } from "@/lib/database"
import AddActivityForm from "@/components/add-activity-form"
import UpdateStatusForm from "@/components/update-status-form"
import RuleBasedAnalysis from "@/components/rule-based-analysis"

// Ensure we have sample data
import { seedSampleLeads } from "@/lib/database"
seedSampleLeads()

export default async function LeadDetailPage({ params }: { params: { id: string } }) {
  const lead = await LeadRepository.getLeadById(params.id)

  if (!lead) {
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold">Lead not found</h1>
        <p className="mt-2">The lead you're looking for doesn't exist or has been removed.</p>
        <Button asChild className="mt-4">
          <Link href="/">Back to Dashboard</Link>
        </Button>
      </div>
    )
  }

  return (
    <main className="container mx-auto p-4 space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">{lead.name}</h1>
        <div
          className={`px-2 py-1 rounded-full text-white text-xs ${lead.score >= 80 ? "bg-green-500" : lead.score >= 60 ? "bg-yellow-500" : "bg-red-500"}`}
        >
          Score: {lead.score}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Tabs defaultValue="overview">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="activities">Activities</TabsTrigger>
              <TabsTrigger value="domains">Domains</TabsTrigger>
              <TabsTrigger value="analysis">Analysis</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Lead Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Source</p>
                      <p>{lead.source}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Portfolio Size</p>
                      <p>{lead.portfolioSize}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Status</p>
                      <p>{lead.status}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Last Activity</p>
                      <p>{lead.lastActivity}</p>
                    </div>
                  </div>

                  {lead.domainCategories && lead.domainCategories.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Domain Categories</p>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {lead.domainCategories.map((category) => (
                          <span
                            key={category}
                            className="px-2 py-1 bg-secondary text-secondary-foreground rounded-md text-xs"
                          >
                            {category}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="activities" className="space-y-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Activity History</CardTitle>
                    <CardDescription>Track all interactions with this lead</CardDescription>
                  </div>
                </CardHeader>
                <CardContent>
                  <AddActivityForm leadId={lead.id} />

                  <div className="space-y-4 mt-6">
                    {lead.activities && lead.activities.length > 0 ? (
                      lead.activities.map((activity, index) => (
                        <div key={index} className="flex gap-4 pb-4 border-b">
                          <div className="bg-primary/10 p-2 rounded-full h-fit">
                            <Calendar className="h-4 w-4 text-primary" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-medium">{activity.type}</p>
                              <p className="text-xs text-muted-foreground">{activity.date}</p>
                            </div>
                            <p className="text-sm mt-1">{activity.notes}</p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-muted-foreground text-center py-4">
                        No activities recorded yet. Add your first activity above.
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="domains" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Domain Portfolio</CardTitle>
                  <CardDescription>Sample domains from this lead's portfolio</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    This section would display sample domains from the lead's portfolio, which would be collected by the
                    AIGNE agents during scraping.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="analysis" className="space-y-4">
              <RuleBasedAnalysis lead={lead} />
            </TabsContent>
          </Tabs>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {lead.contactInfo?.email && (
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <a href={`mailto:${lead.contactInfo.email}`} className="text-primary hover:underline">
                    {lead.contactInfo.email}
                  </a>
                </div>
              )}

              {lead.contactInfo?.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <a href={`tel:${lead.contactInfo.phone}`} className="text-primary hover:underline">
                    {lead.contactInfo.phone}
                  </a>
                </div>
              )}

              {lead.contactInfo?.website && (
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-muted-foreground" />
                  <a
                    href={lead.contactInfo.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    {lead.contactInfo.website}
                  </a>
                </div>
              )}

              <div className="pt-4">
                <Button className="w-full">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Contact Lead
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="mt-4">
            <CardHeader>
              <CardTitle>Lead Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <UpdateStatusForm leadId={lead.id} currentStatus={lead.status} />
              <Button variant="outline" className="w-full justify-start">
                Add to Campaign
              </Button>
              <Button variant="outline" className="w-full justify-start">
                Export Data
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  )
}

