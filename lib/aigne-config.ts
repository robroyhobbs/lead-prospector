export const sedoScraperConfig = {
  name: "sedo_portfolio_scraper",
  description: "Scrapes Sedo marketplace for large domain portfolio holders",
  tools: [
    {
      name: "web_scraper",
      config: {
        urls: ["https://sedo.com/search/searchresult.php?trackingType=portfolio"],
        selectors: {
          portfolioHolders: ".portfolio-seller",
          domainCount: ".domain-count",
          contactInfo: ".seller-contact",
        },
      },
    },
    {
      name: "llm_completion",
      config: {
        provider: "groq",
        model: "llama-3.3-70b-versatile", // Using Llama 3.3 70B via Groq [^4]
        prompt: `
          <Thinking>
          Analyze the following data scraped from a domain marketplace.
          Extract the following information in a structured format:
          1. Company or seller name
          2. Estimated portfolio size (number of domains)
          3. Any contact information (email, website, phone)
          4. Domain categories or specializations if mentioned
          5. Any indicators of whether they might be interested in bulk domain deals
          
          Be precise and extract only factual information present in the data.
          </Thinking>
          
          <answer>
          {
            "name": "extracted company name",
            "portfolioSize": "extracted size",
            "contactInfo": {
              "email": "extracted email if present",
              "website": "extracted website if present",
              "phone": "extracted phone if present"
            },
            "domainCategories": ["category1", "category2"],
            "potentialInterest": "high/medium/low based on analysis"
          }
          </answer>
        `,
        temperature: 0.1, // Low temperature for more deterministic extraction
        apiKey: "{{GROQ_API_KEY}}", // Will be replaced with environment variable
      },
    },
  ],
  output: {
    database: "replit_db",
    collection: "leads",
  },
  schedule: "daily",
}

