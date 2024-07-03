export const LEAD_OBSERVER_PROMPT_TEMPLATE = `Analyze the Sales Representative's message to determine if they are requesting information from the provided list of fields. Respond with a JSON object indicating whether a lead is present and, if so, which contact field it belongs to.
Fields list:
{{fields}}
Contact fields list:
{{contactFieldList}}
Message:
{{message}}
Respond with a JSON object in the following format:
{
"lead": boolean,
"type": "field_name_if_lead_is_true",
"contactField": "corresponding_contact_field_if_lead_is_true"
}
Notes:

- Set "lead": true if the Sales Representative is requesting information from the fields list.
- Set "lead": false if no information from the fields list is being requested.
- Ignore confirmations of already provided information.
- If "lead": true, include the "type" and "contactField" properties.
- If "lead": false, omit the "type" and "contactField" properties.

Provide only the JSON object without additional text or explanations.`