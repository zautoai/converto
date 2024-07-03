export const CTA_CREATOR_PROMPT = `As an experienced marketer, analyze the provided company website data and corresponding URLs. Generate a JSON array of CTA objects suitable for converting potential customers. Each CTA object should have a label, text, and link.
Guidelines:

CTA label: Suitable for use in buttons
CTA text: Motivating, less than 10 words
CTA link: Use only provided URLs, no new URLs

Analyze the webpage details below:
<article>
{{context}}
</article>
Respond with a JSON array of CTA objects. Format:
[
{
"label": "",
"text": "",
"link": ""
},
...
]
The number of CTA objects should match the number of input URLs. Provide only the JSON array without additional text.` 