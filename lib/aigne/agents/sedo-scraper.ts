import type { AgentConfig } from "../config"

export const sedoScraperConfig: AgentConfig = {
  name: "sedo_portfolio_scraper",
  description: "Scrapes Sedo marketplace for large domain portfolio holders",
  enabled: true,
  tools: [
    {
      name: "web_scraper",
      config: {
        urls: ["https://sedo.com/search/searchresult.php?trackingType=portfolio"],
        selectors: {
          portfolioHolders: ".portfolio-seller",
          domainCount: ".domain-count",
          contactInfo: ".seller-contact",
          domainCategories: ".domain-categories",
        },
        pagination: {
          nextButton: ".pagination .next",
          maxPages: 5,
        },
        delay: 2000, // 2 seconds between requests
        userAgent: "Mozilla/5.0 (compatible; DomainProspector/1.0)",
      },
    },
    {
      name: "python_interpreter",
      config: {
        script: `
          # Process the scraped data
          def process_data(scraped_data):
              results = []
              
              for item in scraped_data:
                  # Extract portfolio size
                  portfolio_size = "Unknown"
                  if "domainCount" in item and item["domainCount"]:
                      count_text = item["domainCount"]
                      # Extract numbers from text like "500+ domains"
                      import re
                      numbers = re.findall(r'\\d+', count_text)
                      if numbers:
                          portfolio_size = f"{numbers[0]}+"
                  
                  # Extract contact info
                  contact_info = {}
                  if "contactInfo" in item and item["contactInfo"]:
                      contact_text = item["contactInfo"]
                      # Extract email with regex
                      import re
                      email_match = re.search(r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}', contact_text)
                      if email_match:
                          contact_info["email"] = email_match.group(0)
                      
                      # Extract website with regex
                      website_match = re.search(r'https?://[^\\s]+', contact_text)
                      if website_match:
                          contact_info["website"] = website_match.group(0)
                  
                  # Extract domain categories
                  domain_categories = []
                  if "domainCategories" in item and item["domainCategories"]:
                      categories_text = item["domainCategories"]
                      # Split by commas or other separators
                      import re
                      categories = re.split(r'[,|;]', categories_text)
                      domain_categories = [cat.strip() for cat in categories if cat.strip()]
                  
                  # Create the lead object
                  lead = {
                      "name": item.get("portfolioHolders", "Unknown Seller"),
                      "source": "Sedo",
                      "portfolioSize": portfolio_size,
                      "contactInfo": contact_info,
                      "domainCategories": domain_categories,
                      "status": "New",
                      "score": calculate_score(portfolio_size, contact_info, domain_categories)
                  }
                  
                  results.append(lead)
              
              return results
          
          # Simple scoring function
          def calculate_score(portfolio_size, contact_info, domain_categories):
              score = 50  # Base score
              
              # Portfolio size scoring
              if "+" in portfolio_size:
                  size_str = portfolio_size.replace("+", "")
                  try:
                      size = int(size_str)
                      if size > 1000:
                          score += 30
                      elif size > 500:
                          score += 20
                      elif size > 100:
                          score += 10
                  except:
                      pass
              
              # Contact info completeness
              if contact_info:
                  if "email" in contact_info:
                      score += 5
                  if "website" in contact_info:
                      score += 5
              
              # Web3 domain categories
              web3_keywords = ["crypto", "web3", "nft", "blockchain"]
              if any(keyword in cat.lower() for cat in domain_categories for keyword in web3_keywords):
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

