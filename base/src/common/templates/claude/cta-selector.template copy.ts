export const CTA_SELECTOR_PROMPT = `As an experienced marketer, analyze the provided conversation between a sales assistant and a potential prospect, along with the list of CTAs. Select suitable CTAs based on the conversation, following these rules:

1. Understand the customer's needs, challenges, and position in the buying journey before selecting CTAs.
2. Ensure the prospect is ready to take action before sharing CTAs.
3. Do not select CTAs if the prospect lacks intention or needs more information.

Conversation:
{{conversation}}
CTA List:
{{ctasList}}
Respond with a JSON array of selected CTA IDs. At least one CTA should be selected if appropriate. Format:
[
"CTA_ID_1",
"CTA_ID_2"
]
Provide only the JSON array without additional text.`