export const LEAD_OBSORVER_PROMPT_TEMPLATE = `You will be provided with a message which is sent by the Sales Reperesentative to a prospect
and the list of fields for which the prospect can answer. your task is to find whether the Sales Rep is asking the prospect to answer any of the following fields 
Here is the list of Fields,
{{fields}}

Remember you should consider lead=true if the Sales Reperesentative is asking for any of the info in the list of Field, 
not for confirming messages, Like I got your {{exampleField1}}.

You should also consider lead=false if the Sales Reperesentative is not asking for any of the info in the list of Fields.

Here is the Message,
{{message}}

Example 1: 

Content:
Please share your {{exampleField1}}.

Output: 
{
   "lead": true,
   "type": "{{exampleField1}}"
}

END of Example 1

Your output should be in JSON format only`