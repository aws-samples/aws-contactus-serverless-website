import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";
const SES_SEND_FROM = process.env.SES_SEND_FROM;
const SES_SEND_TO = process.env.SES_SEND_TO;
const SES_REGION = process.env.SES_REGION;
const ses = new SESClient({ region: SES_REGION });

export const putContactUsHandler = async (event) => {

    //validate the request method
    if (event.httpMethod !== 'POST') {
        throw new Error(`postMethod only accepts POST method, you tried: ${event.httpMethod} method.`);
    }

    //log the payload
    console.log('received:', event.body);

    //parse the payload
    const payload = JSON.parse(event.body);

    //validate the request payload and attributes
    validatePayload(event, payload);

    //create the email command
    const command = new SendEmailCommand({
        Destination: {
            ToAddresses: [SES_SEND_TO],
        },
        Message: {
            Body: {
                Text: {
                    Data: 'Name: ' + payload.name + '\nPhone: ' + payload.phone + '\nEmail: ' + payload.email + '\nDescription: ' + payload.description,
                    Charset: 'UTF-8'
                }
            },
            Subject: {
                Data: 'Contact Us Form Recieved From: ' + payload.name,
                Charset: 'UTF-8'
            }
        },
        Source: SES_SEND_FROM
    });

    //send the email
    try {
        let ses_response = await ses.send(command);
        console.info(`SES response for: ${event.httpMethod} is: ${ses_response.statusCode} `);
        return generateResponse(200, "Success")
    }
    catch (error) {
        console.info(`error: ${error}`);
        return generateResponse(500, "Failure")
    }

};

//validate payload
var validatePayload = function(event, payload) {
    if (payload.name === undefined || payload.phone === undefined || payload.email === undefined || payload.description === undefined){
        throw new Error(`Bad request. Please check the request data for: ${event.httpMethod} method.`);
    }
    validatePayloadAttribute("name", payload.name, /^[A-Za-z ]{1,32}$/);
    validatePayloadAttribute("phone", payload.phone, /^[0-9]{10}$/);
    validatePayloadAttribute("email", payload.email, /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/);
    validatePayloadAttribute("description", payload.description, /^[A-Za-z0-9 ]{5,255}$/);
}

//validate payload attribute
var validatePayloadAttribute = function(attrName, attrValue, regexPattern) {
    if (regexPattern.test(attrValue)) {
        return true;
    } else {
        throw new Error(`invalid ${attrName}: ${attrValue}`);
    }
}

//generate response
var generateResponse = function(statusCode, message) {
    return {
        "statusCode": statusCode,
        "headers": { 
            "Content-Type": "application/json"
        },
        "isBase64Encoded": false,
        "body": `{ \"result\": \"${message}\"}`
    };;
}