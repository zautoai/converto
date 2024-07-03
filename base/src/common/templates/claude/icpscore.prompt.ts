export const ICP_SCORE_PROMPT = `Analyze the given contact information against the provided list of Ideal Customer Profiles (ICPs). Determine the most appropriate ICP category for the contact, excluding "Inbound Default" and "Outbound Default" unless the contact is unfit for all other ICPs.

ICP List:
{{icpList}}

Categorize the contact as:
1. Fit: Fully matches an ICP's criteria
2. Partially Fit: Matches some criteria of an ICP
3. Unfit: Doesn't match any ICP criteria

Rules:
- For multiple Fit ICPs, choose the highest-scoring one
- For multiple Partially Fit ICPs, choose the one with more "fit" criteria; if tied, select the highest-scoring one
- For Unfit contacts, assign to "Inbound Default" or "Outbound Default" based on contact information

Respond with a JSON object in the following format:

{
  "id": "",
  "category": "",
  "justification": "",
  "score": 0
}

Provide only the JSON object without additional text or explanations.`