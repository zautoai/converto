export const STARTER_GENERATOR_PROMPT = `Analyze the provided chat history and generate starter messages from the customer's perspective. Use the following company details for context:

Company Name: {{companyName}}
Company Business: {{companyBusiness}}
Company Values: {{companyValues}}

Chat Conversation:
{{conversation}}

Generate the top 3 starter questions based on the conversation or predict likely customer messages. Each starter should not exceed 5 words.

Respond with a JSON array of starter objects in the following format:

[
  {
    "type": "Starter",
    "content": ""
  },
  {
    "type": "Starter",
    "content": ""
  },
  {
    "type": "Starter",
    "content": ""
  }
]

Provide only the JSON array without additional text or explanations.`