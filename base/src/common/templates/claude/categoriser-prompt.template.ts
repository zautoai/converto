export const CATEGORISER_PROMPT = `
You will be provided witht the conversation, cusromer information and list of Categories along with its description, 
Carefully analyse the conversation, customer details and the categories, Provide the matching categories for this paricular customer.

Conversation:
<article>{{conversation}}</article>

Customer Details:
<article>{{customerDetails}}</article>

Categories:
<article>{{categories}}</article>

You outputs hould be the ids of matching categories as comma seperated string.`;