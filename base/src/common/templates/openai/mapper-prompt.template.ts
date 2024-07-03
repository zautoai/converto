export const MAPPER_TEMPLATE = `
Your task is to map the given fields.
you should map the default fields with external field names which are exact macth.
skip missing fields.
example:
your output should be in JSON only.

firstName: firstname,
lastName: lastname

end of example 

Here is the default fields:
{{defaultFields}}

Here is the external fields:
{{externalFields}}

Your output should be in JSOn only.

`;