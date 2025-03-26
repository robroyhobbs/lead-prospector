import { NextResponse } from "next/server"
import { groq } from "@ai-sdk/groq"
import { generateText } from "ai"

export async function POST(request: Request) {
  try {
    const { lead } = await request.json()

    const { text } = await generateText({
      model: groq("llama-3.3-70b-versatile"),
      prompt: `
        <Thinking>
        Analyze this potential lead for a Web2/Web3 domain business:
        
        Lead Information:
        - Name: ${lead.name}
        - Portfolio Size: ${lead.portfolioSize}
        - Source: ${lead.source}
        - Domain Categories: ${lead.domainCategories?.join(", ") || "Unknown"}
        - Contact Info: ${JSON.stringify(lead.contactInfo || {})}
        - Current Status: ${lead.status}
        
        Provide a comprehensive analysis including:
        1. A numerical score from 0-100 indicating the value of this lead
        2. A detailed reasoning for this score
        3. 2-3 recommended next actions for the sales team
        </Thinking>
        
        <answer>
        {
          "score": 85,
          "reasoning": "This lead has a large portfolio of over 500 domains with a focus on tech and crypto categories. The contact information is complete, making outreach straightforward.",
          "recommendations": [
            "Reach out via email with a personalized message highlighting bulk domain management benefits",
            "Offer a free portfolio analysis to demonstrate value",
            "Schedule a demo focused on their specific domain categories"
          ]
        }
        </answer>
      `,
      temperature: 0.3,
    })

    try {
      const result = JSON.parse(text)
      return NextResponse.json(result)
    } catch (e) {
      console.error("Failed to parse Llama response:", e)
      return NextResponse.json({ error: "Failed to parse analysis" }, { status: 500 })
    }
  } catch (error) {
    console.error("Analysis failed:", error)
    return NextResponse.json({ error: "Analysis failed" }, { status: 500 })
  }
}

