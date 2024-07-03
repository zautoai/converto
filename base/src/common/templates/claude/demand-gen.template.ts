export const DEMAND_GENT_CAMPAIGN_FINDR_PROMPT = `Analyze the provided UTM parameters to determine the campaign's title, description, target audience, and source. Respond with a JSON object containing these details. Format:

{
  "title": "",
  "description": "",
  "target_audience": "",
  "source": ""
}

Provide only the JSON object without additional text or explanations.`