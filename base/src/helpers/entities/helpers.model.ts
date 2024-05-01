import { AVATAR_HELPER_PROMPT } from "src/common/templates/agent-prompt.template";
import { CTA_CREATOR_PROMPT } from "src/common/templates/cta-creator.template";
import { GREETER_PROPMT } from "src/common/templates/page-greeter.template";



export enum HelperName {
    ZautoMarketingExpert = 'ZautoMarketingExpert',
    ZautoPageGreeter = 'ZautoPageGreeter',
    ZautoCTACreator = 'ZautoCTACreator'
}

// 1. Company Name
// 2. Company's business 
// 3. Company's value 
// 4. My tone when I am talking to the customer
// 5. What I should look for when I am chatting with the customer
// 6. How I can find whether the customer is valid target customer?
// 7. How I can get the lead while chatting with the customer?
// 8. What are all the details I should ask for the customer if they are interested.

export const CB_FUNCTIONS = {
    get_bdr_training_info: (data)=> JSON.stringify(JSON.parse(data))
}
  

export const ZAUTO_HELPERS = [
    {
        name: HelperName.ZautoMarketingExpert,
        description: 'It will help to provide BDR Avatar Instructions',
        instructions: AVATAR_HELPER_PROMPT,
        model: 'gpt-4-1106-preview',
        // tools: [
        //     {
        //         name: "get_bdr_training_info",
        //         description: "Get required infor to train the junior BDR",
        //         parameters: {
        //             type: "object",
        //             properties: {
        //             companyName: {
        //                 type: "string",
        //                 description: "Name of the company"
        //             },
        //             companyBusiness: {
        //                 type: "string",
        //                 description: "Major Business of the company"
        //             },
        //             companyValue: {
        //                 type: "string",
        //                 description: "Value offering by the company"
        //             },
        //             tone: {
        //                 type: "string",
        //                 description: "Tone of the BDR while chatting with the customer"
        //             },
        //             purposeOfChat: {
        //                 type: "string",
        //                 description: "Purpose of the communication when BDR is chating with the customer"
        //             },
        //             toValidateCustomer: {
        //                 type: "string",
        //                 description: "Instruction on how to validate the customer"
        //             },
        //             toGetLead: {
        //                 type: "string",
        //                 description: "Instruction on how to validate the potential customer"
        //             },
        //             customerInfo: {
        //                 type: "string",
        //                 description: "The contact info which should ask to the customer"
        //             }
        //             },
        //             "required": [
        //             "companyName",
        //             "companyBusiness",
        //             "companyValue",
        //             "tone",
        //             "purposeOfChat",
        //             "toValidateCustomer",
        //             "toGetLead",
        //             "customerInfo"
        //             ]
        //         }
        //     }
        // ]
    },
    {
        name: HelperName.ZautoPageGreeter,
        description: 'It will help to generate greetings',
        instructions: GREETER_PROPMT,
        model: 'gpt-4-1106-preview',
    },
    {
        name: HelperName.ZautoCTACreator,
        description: 'It will help to generate CTAs for companies',
        instructions: CTA_CREATOR_PROMPT,
        model: 'gpt-4-1106-preview',
    }
];