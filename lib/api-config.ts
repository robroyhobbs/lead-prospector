// Secure API key management
export function getGroqConfig() {
  // Check for environment variable
  const apiKey = process.env.GROQ_API_KEY

  if (!apiKey) {
    console.error("GROQ_API_KEY environment variable not set")
    throw new Error("Groq API key not configured")
  }

  return {
    apiKey,
    // Other configuration options
    baseUrl: "https://api.groq.com/v1",
  }
}

