
export const LEAD_OBSORVER_PROMPT_TEMPLATE = `
You are lead analyser. you will be provided with list of Fields and Message from a BDR, your task is to find whether the BDR is asking any of the info which is in the list of Fields. 

Here is the list of Fields,
{{fields}}

Remember you should consider lead=true if the BDR is asking for any of the info in the list of Field, 
not for confirming messages, Like I got your {{exampleField1}}.

You should also consider lead=false if the BDR is not asking for any of the info in the list of Fields.

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