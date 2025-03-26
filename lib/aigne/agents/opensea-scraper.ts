import type { AgentConfig } from "../config"

export const openSeaScraperConfig: AgentConfig = {
  name: "opensea_domain_scanner",
  description: "Scans OpenSea for Web3 domain sellers",
  enabled: true,
  tools: [
    {
      name: "web_scraper",
      config: {
        urls: ["https://opensea.io/collection/ens"],
        selectors: {
          sellers: ".Asset--owner",
          domainNames: ".Asset--title",
          prices: ".Price--amount",
        },
        pagination: {
          nextButton: ".Pagination--button[aria-label='Next']",
          maxPages: 3,
        },
        delay: 3000, // 3 seconds between requests
        userAgent: "Mozilla/5.0 (compatible; DomainProspector/1.0)",
      },
    },
    {
      name: "python_interpreter",
      config: {
        script: `
          # Process the scraped data
          def process_data(scraped_data):
              # Group by seller to identify portfolio holders
              sellers = {}
              
              for item in scraped_data:
                  seller = item.get("sellers")
                  if not seller:
                      continue
                  
                  if seller not in sellers:
                      sellers[seller] = {
                          "domains": [],
                          "prices": []
                      }
                  
                  if "domainNames" in item:
                      sellers[seller]["domains"].append(item["domainNames"])
                  
                  if "prices" in item:
                      sellers[seller]["prices"].append(item["prices"])
              
              # Convert to leads (only those with multiple domains)
              results = []
              for seller, data in sellers.items():
                  if len(data["domains"]) >= 3:  # Consider as portfolio if 3+ domains
                      # Create the lead object
                      lead = {
                          "name": seller,
                          "source": "OpenSea",
                          "portfolioSize": f"{len(data['domains'])}+",
                          "contactInfo": {
                              "website": f"https://opensea.io/{seller}"
                          },
                          "domainCategories": ["web3", "nft", "ens"],
                          "status": "New",
                          "score": calculate_score(len(data["domains"]))
                      }
                      
                      results.append(lead)
              
              return results
          
          # Simple scoring function
          def calculate_score(domain_count):
              score = 60  # Base score for Web3 domains
              
              # Portfolio size scoring
              if domain_count > 20:
                  score += 30
              elif domain_count > 10:
                  score += 20
              elif domain_count > 5:
                  score += 10
              
              # Web3 domains are automatically high value
              score += 10
              
              return min(score, 100)  # Cap at 100
          
          # Process the data and return results
          processed_leads = process_data(scraped_data)
          return processed_leads
        `,
        inputVariable: "scraped_data",
        outputVariable: "processed_leads",
      },
    },
  ],
  output: {
    database: "replit_db",
    collection: "leads",
  },
  schedule: "daily",
}

