export const CALENDAR_OBSORVER_PROMPT_TEMPLATE =`
you will be provided witht the conversation between the Assistant-SDR and a potential customer,
your task is to find whether the customer is interested to schedule a demo or call which requires calendar booking.

Remember 
You should return schedule=true if the customer is open to schedule a demo or call.
You should return schedule=true if the Assistant-SDR is asking for date and time to schedule a demo.
You Should return schedule=false for confirming messages like "Your demo is scheduled".
You should return schedule=false if the Assistant-SDR is asking any other information other than schedule a demo or call.


Example 1: 
{
    "schedule": true
}
END of Example 1

Here is the conversation:
{{conversation}}

Your output should be in JSON format only.
`;

export const SCHEDULE_SUMMERIZER_PROMPT_TEMPLATE = `
your task is to analyse the Chat Conversation between the SDR and a potential prospects, 
you will be provided with the chat conversation
your task is to provide the meeting summary and description.
summary should be with prospect name.
Example 1: 
{
    "summary": "Product Demo with John",
    "description": "Presentation of our latest product features and functionalities."
}
 
END of Example 1

Here is the conversation:
{{conversation}}

Your output should be in JSON format only.

`;