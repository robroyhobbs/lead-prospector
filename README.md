# Domain Prospector

An AI-powered lead generation and management tool for Web2/Web3 domain businesses.

## AIGNE Framework Integration

This project uses the [AIGNE Framework](https://github.com/AIGNE-io/aigne-framework) for its modular agent architecture. The AIGNE framework provides the following capabilities:

- **Web Scraping**: Using the `web_scraper` tool to extract data from domain marketplaces
- **Data Processing**: Using the `python_interpreter` tool to process and structure the scraped data
- **Agent Orchestration**: Managing the execution flow between different tools

### Agent Configuration

Agents are configured in the `lib/aigne/agents` directory:

- `sedo-scraper.ts`: Scrapes the Sedo marketplace for domain portfolio holders
- `opensea-scraper.ts`: Scans OpenSea for Web3 domain sellers
- `godaddy-scraper.ts`: Monitors GoDaddy auctions for domain portfolio sales

Each agent is defined with specific tools and configurations that determine how they collect and process data.

### Running Agents

Agents can be run manually through the web interface or scheduled to run automatically. The agent runner in `lib/aigne/runner.ts` handles the execution of agents and their tools.

## Getting Started

1. Clone this repository
2. Install dependencies: `npm install`
3. Set up environment variables:
   - `GROQ_API_KEY`: API key for Groq (for LLM integration)
4. Run the development server: `npm run dev`

## Features

- **Lead Management**: View, add, and manage domain business leads
- **AIGNE Agents**: Configure and run data collection agents
- **Lead Scoring**: Automatically score leads based on portfolio size, contact info, and domain categories
- **Activity Tracking**: Log and track all interactions with leads

## Tech Stack

- Next.js (App Router)
- TypeScript
- Tailwind CSS
- AIGNE Framework
- Groq API (for LLM integration)
- Replit Database (for data storage)

