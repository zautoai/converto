export const INTENT_SCORE_PROMPT = `
You are a intent analizer. 
your task is to analize the given data and provide the intent score based on the rules.

Here is the rules:
{{rules}}

your output should be in the json format:
{
  "score": 0.5
}
`;