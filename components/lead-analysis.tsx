"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2 } from "lucide-react"

export default function LeadAnalysis({ lead }) {
  const [analysis, setAnalysis] = useState(null)
  const [loading, setLoading] = useState(false)

  const analyzeWithRules = () => {
    setLoading(true)

    // Simulate analysis delay
    setTimeout(() => {
      // Simple rule-based analysis (placeholder for LLM)
      const portfolioSize = lead.portfolioSize.replace(/\D/g, "")
      const size = Number.parseInt(portfolioSize) || 0

      let score = 50 // Base score
      const reasoning = []
      const recommendations = []

      // Portfolio size scoring
      if (size > 1000) {
        score += 30
        reasoning.push("Very large portfolio of over 1000 domains")
      } else if (size > 500) {
        score += 20
        reasoning.push("Large portfolio of over 500 domains")
      } else if (size > 100) {
        score += 10
        reasoning.push("Medium portfolio of over 100 domains")
      } else {
        reasoning.push("Smaller portfolio size")
      }

      // Contact info completeness
      if (lead.contactInfo) {
        if (lead.contactInfo.email) {
          score += 5
          reasoning.push("Email contact available for direct outreach")
        }

        if (lead.contactInfo.website) {
          score += 5
          reasoning.push("Website available for research")
        }

        if (lead.contactInfo.phone) {
          score += 5
          reasoning.push("Phone contact available for direct outreach")
        }
      } else {
        reasoning.push("Limited contact information")
        recommendations.push("Research additional contact methods")
      }

      // Domain categories
      if (lead.domainCategories && lead.domainCategories.length > 0) {
        const hasWeb3 = lead.domainCategories.some((cat) =>
          ["crypto", "web3", "nft", "blockchain"].includes(cat.toLowerCase()),
        )

        if (hasWeb3) {
          score += 15
          reasoning.push("Portfolio includes Web3/crypto domains (high priority)")
          recommendations.push("Highlight Web3 domain management features in outreach")
        }

        const hasBusiness = lead.domainCategories.some((cat) =>
          ["business", "finance", "tech"].includes(cat.toLowerCase()),
        )

        if (hasBusiness) {
          score += 5
          reasoning.push("Portfolio includes business/finance domains")
        }
      }

      // Cap score at 100
      score = Math.min(score, 100)

      // Add recommendations based on score and data
      if (score >= 80) {
        recommendations.push("High-priority lead - schedule personalized outreach")
        recommendations.push("Offer premium portfolio management services")
      } else if (score >= 60) {
        recommendations.push("Medium-priority lead - include in regular outreach")
        recommendations.push("Highlight bulk domain management benefits")
      } else {
        recommendations.push("Lower-priority lead - include in general marketing")
        recommendations.push("Focus on educational content to build interest")
      }

      // Add contact-specific recommendations
      if (lead.contactInfo?.email) {
        recommendations.push("Send personalized email highlighting relevant services")
      } else if (lead.contactInfo?.website) {
        recommendations.push("Research company via website before outreach")
      }

      setAnalysis({
        score,
        reasoning: reasoning.join(". "),
        recommendations,
      })

      setLoading(false)
    }, 1500)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Lead Analysis</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          This is a placeholder for LLM-based lead analysis. When the Groq API key is available, this will use Llama 3.3
          to provide intelligent analysis.
        </p>

        {!analysis && !loading && <Button onClick={analyzeWithRules}>Generate Analysis</Button>}

        {loading && (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            <span className="ml-2">Analyzing lead...</span>
          </div>
        )}

        {analysis && (
          <div className="space-y-3">
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

            {analysis.recommendations && (
              <div>
                <h3 className="font-medium">Recommended Actions</h3>
                <ul className="list-disc list-inside text-sm mt-1">
                  {analysis.recommendations.map((rec, i) => (
                    <li key={i}>{rec}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="pt-2 text-center">
              <p className="text-xs text-muted-foreground">
                Note: This is a rule-based analysis. LLM analysis will be available when the Groq API key is added.
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

