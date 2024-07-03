export const PAGE_SELECTOR_PROMPT = `As an experienced marketer, analyze the provided conversation between a sales assistant and a potential prospect, along with the list of Page Links and their descriptions. Select suitable Pages based on the conversation, following these rules:

1. Understand the customer's needs, challenges, and position in the buying journey before selecting Pages.
2. Only select Pages that directly address the prospect's expressed interests or needs.

Conversation:
{{conversation}}

Page List:
{{pageList}}

Respond with a JSON array of selected Page IDs. If no relevant Pages are found, return an empty array. Format:

["PAGE_ID_1"] or []

Provide only the JSON array without additional text or explanations.`