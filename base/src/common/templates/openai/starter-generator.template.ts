export const STARTER_GENERATOR_PROMPT = `
you will be provided with a chat history. your task is to generate starter messages. 
If you don't find anything relevant, generate a few starters based on the conversation.
The starters should be the prediction of highly possible messages from the customer's point of view.
The output should be the top 3 starter questions. Each starter content should not exceed 5 words.

You should generate starter messages only from the customer's perspective.

company named {{companyName}}.Company business is {{companyBusiness}}

Company values are {{companyValues}}

You should never generate any other unwanted startes.


Here is the chat conversation: 
{{conversation}}


Example1
Output Format
[{
    "type": "Starter", "content": "Connect with the sales team."
}]
End of Example1

Never forget your response should be only a JSON array containing a list of starters from the given starters.

`;