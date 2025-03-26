"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2 } from "lucide-react"

export interface Lead {
  id: string
  name: string
  source: string
  portfolioSize: string
  contactInfo?: {
    email?: string
    website?: string
    phone?: string
  }
  domainCategories?: string[]
  score: number
  status: string
  lastActivity: string
}

export interface AnalysisResult {
  score: number
  reasoning: string
  recommendations: string[]
  strengths: string[]
  weaknesses: string[]
}

export default function RuleBasedAnalysis({ lead }: { lead: Lead }) {
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null)
  const [loading, setLoading] = useState(false)

  const analyzeWithRules = () => {
    setLoading(true)

    // Simulate analysis delay
    setTimeout(() => {
      // Extract portfolio size
      const portfolioSize = lead.portfolioSize.replace(/\D/g, "")
      const size = Number.parseInt(portfolioSize) || 0

      let score = 50 // Base score
      const reasoning = []
      const recommendations = []
      const strengths = []
      const weaknesses = []

      // Portfolio size scoring
      if (size > 1000) {
        score += 30
        reasoning.push("Very large portfolio of over 1000 domains")
        strengths.push("Large domain portfolio indicates significant investment and potential for bulk deals")
      } else if (size > 500) {
        score += 20
        reasoning.push("Large portfolio of over 500 domains")
        strengths.push("Substantial domain portfolio indicates serious investment in the space")
      } else if (size > 100) {
        score += 10
        reasoning.push("Medium portfolio of over 100 domains")
        strengths.push("Good-sized domain portfolio with potential for multiple sales")
      } else {
        reasoning.push("Smaller portfolio size")
        weaknesses.push("Limited portfolio size may indicate lower potential for bulk deals")
      }

      // Contact info completeness
      if (lead.contactInfo) {
        let contactPoints = 0

        if (lead.contactInfo.email) {
          contactPoints += 5
          strengths.push("Direct email contact available for outreach")
        } else {
          weaknesses.push("No email contact available")
        }

        if (lead.contactInfo.website) {
          contactPoints += 5
          strengths.push("Website available for research and alternative contact methods")
        }

        if (lead.contactInfo.phone) {
          contactPoints += 5
          strengths.push("Direct phone contact available for immediate outreach")
        }

        if (contactPoints > 0) {
          score += contactPoints
          reasoning.push(`${contactPoints > 10 ? "Complete" : "Partial"} contact information available`)
        } else {
          reasoning.push("No contact information available")
          weaknesses.push("Lack of contact information will make outreach difficult")
          recommendations.push("Research additional contact methods before attempting outreach")
        }
      } else {
        reasoning.push("No contact information available")
        weaknesses.push("Lack of contact information will make outreach difficult")
        recommendations.push("Research additional contact methods before attempting outreach")
      }

      // Domain categories
      if (lead.domainCategories && lead.domainCategories.length > 0) {
        const hasWeb3 = lead.domainCategories.some((cat) =>
          ["crypto", "web3", "nft", "blockchain"].includes(cat.toLowerCase()),
        )

        if (hasWeb3) {
          score += 15
          reasoning.push("Portfolio includes Web3/crypto domains (high priority)")
          strengths.push("Focus on Web3/crypto domains aligns with our strategic priorities")
          recommendations.push("Highlight Web3 domain management features in outreach")
          recommendations.push("Mention blockchain integration capabilities for domain management")
        }

        const hasBusiness = lead.domainCategories.some((cat) =>
          ["business", "finance", "tech"].includes(cat.toLowerCase()),
        )

        if (hasBusiness) {
          score += 5
          reasoning.push("Portfolio includes business/finance domains")
          strengths.push("Business/finance domains typically have higher commercial value")
        }

        const hasPremium = lead.domainCategories.some((cat) => ["premium"].includes(cat.toLowerCase()))

        if (hasPremium) {
          score += 10
          reasoning.push("Portfolio includes premium domains")
          strengths.push("Premium domains indicate high-value assets and investment")
        }
      } else {
        reasoning.push("Unknown domain categories")
        weaknesses.push("Lack of domain category information makes value assessment difficult")
        recommendations.push("Research domain portfolio to identify key categories and value")
      }

      // Source reliability
      switch (lead.source) {
        case "Sedo":
        case "GoDaddy Auctions":
          score += 5
          reasoning.push("Lead from highly reliable marketplace source")
          strengths.push("Established marketplace source increases confidence in data")
          break
        case "OpenSea":
          score += 10
          reasoning.push("Lead from Web3-focused marketplace (high priority)")
          strengths.push("Web3 marketplace source indicates alignment with our target market")
          break
        case "Manual Entry":
          score += 8
          reasoning.push("Manually entered lead (likely pre-qualified)")
          strengths.push("Manually entered leads typically have higher quality information")
          break
      }

      // Status-based adjustments
      switch (lead.status) {
        case "Contacted":
          recommendations.push("Follow up within 3-5 business days if no response")
          break
        case "Interested":
          score += 10
          reasoning.push("Lead has expressed interest")
          strengths.push("Already expressed interest in our services")
          recommendations.push("Prioritize for immediate follow-up with detailed proposal")
          break
        case "Not Interested":
          score -= 20
          reasoning.push("Lead has expressed lack of interest")
          weaknesses.push("Previously indicated not interested in our services")
          recommendations.push("Consider revisiting in 3-6 months with new offerings")
          break
      }

      // Cap score at 100
      score = Math.min(score, 100)

      // Add recommendations based on score
      if (score >= 80) {
        recommendations.push("High-priority lead - schedule personalized outreach within 24 hours")
        recommendations.push("Prepare custom portfolio analysis to demonstrate value")
        recommendations.push("Consider offering premium tier services or custom solutions")
      } else if (score >= 60) {
        recommendations.push("Medium-priority lead - include in regular outreach within the week")
        recommendations.push("Highlight bulk domain management benefits and cost savings")
        recommendations.push("Offer standard tier services with option to upgrade")
      } else {
        recommendations.push("Lower-priority lead - include in general marketing campaigns")
        recommendations.push("Focus on educational content to build interest and awareness")
        recommendations.push("Consider basic tier services as entry point")
      }

      setAnalysis({
        score,
        reasoning: reasoning.join(". "),
        recommendations,
        strengths,
        weaknesses,
      })

      setLoading(false)
    }, 1000)
  }

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle>Lead Analysis</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          This analysis uses rule-based scoring to evaluate lead potential. When the Groq API key is available, we'll
          enhance this with Llama 3.3 for more sophisticated analysis.
        </p>

        {!analysis && !loading && <Button onClick={analyzeWithRules}>Generate Analysis</Button>}

        {loading && (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            <span className="ml-2">Analyzing lead...</span>
          </div>
        )}

        {analysis && (
          <div className="space-y-4">
            <div>
              <h3 className="font-medium">Opportunity Score</h3>
              <div className="flex items-center mt-1">
                <div className="w-full bg-secondary rounded-full h-2.5">
                  <div className="bg-primary h-2.5 rounded-full" style={{ width: `${analysis.score}%` }}></div>
                </div>
                <span className="ml-2 font-bold">{analysis.score}/100</span>
              </div>
            </div>

            <div>
              <h3 className="font-medium">Analysis</h3>
              <p className="text-sm mt-1">{analysis.reasoning}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="font-medium text-green-600">Strengths</h3>
                <ul className="list-disc list-inside text-sm mt-1">
                  {analysis.strengths.map((strength, i) => (
                    <li key={i}>{strength}</li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="font-medium text-red-600">Weaknesses</h3>
                <ul className="list-disc list-inside text-sm mt-1">
                  {analysis.weaknesses.length > 0 ? (
                    analysis.weaknesses.map((weakness, i) => <li key={i}>{weakness}</li>)
                  ) : (
                    <li>No significant weaknesses identified</li>
                  )}
                </ul>
              </div>
            </div>

            <div>
              <h3 className="font-medium">Recommended Actions</h3>
              <ul className="list-disc list-inside text-sm mt-1">
                {analysis.recommendations.map((rec, i) => (
                  <li key={i}>{rec}</li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

