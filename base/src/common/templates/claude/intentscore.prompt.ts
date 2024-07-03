export const INTENT_SCORE_PROMPT = `Analyze the given prospect activities and calculate an intent score based on the provided rules. Follow these steps:

1. Sum all positive points from the user's interactions.
2. Sum all negative points from the user's interactions.
3. Calculate the total score by adding the sum of positive and negative points.
4. Normalize the total score to a range of 1 to 100.

Normalization: Total points are bounded within -100 to 100, then normalized to 1 to 100.

Rules:
{{rules}}

Prospect Activities:
{{activities}}

Respond with a JSON object containing the calculated scores:

{
  "positiveScore": 0,
  "negativeScore": 0,
  "score": 0
}

Provide only the JSON object without additional text or explanations.`