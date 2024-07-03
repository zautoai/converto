export const LEAD_OBSERVER_PROMPT_TEMPLATE = `You will be provided with a message sent by the Sales Representative to a prospect and a list of fields for which the prospect can provide information. Your task is to determine whether the Sales Representative is asking the prospect to provide any information from the given list of fields.

Here is the list of Fields:
{{fields}}

Remember to consider "lead": true if the Sales Representative is requesting any information from the list of fields, not for confirming messages like "I got your {{exampleField1}}."

You should also consider "lead": false if the Sales Representative is not asking for any information from the list of fields.

If the lead is true, identify which contact field it belongs to from the contactFieldList given below.

Here is the list of contact fields:
{{contactFieldList}}

Here is the Message:
{{message}}

Example 1: 

Content:
Please share your {{exampleField1}}.

Output: 
{
   "lead": true,
   "type": "name of the lead fiels (ex: phone_number or tel_num)",
   "contactField": "name of the contactField which matches the example field(ex: phone for phone_number or tel_no)"
}

END of Example 1

Your output should be in JSON format only.`
