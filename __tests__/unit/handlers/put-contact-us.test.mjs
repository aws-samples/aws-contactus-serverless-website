import { putContactUsHandler } from '../../../src/handlers/put-contact-us.mjs';
import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";
import { mockClient } from "aws-sdk-client-mock";

describe('Test putContactUsHandler', function () { 
    const sesMock = mockClient(SESClient);

    beforeEach(() => {
        sesMock.reset();
    });
 
    it('should respond to only POST requests and return failure for everthing else', async () => { 

        const returnedError = 'postMethod only accepts POST method, you tried: GET method.'; 

        const event = { 
            httpMethod: 'GET', 
            body: '{"name": "test","phone": "3141112222", "email": "test@gmail.com", "description": "Need password reset"}' 
        }; 
     
        try {
            await putContactUsHandler(event);
        } catch (error) {
            expect(error).toBeInstanceOf(Error);
            expect(error).toHaveProperty('message', returnedError);
        }
        expect.assertions(2);

    }); 

    it('should validate the payload and respond with failure if all elements are not present', async () => { 

        const returnedError = 'Bad request. Please check the request data for: POST method.'; 

        const event = { 
            httpMethod: 'POST', 
            body: '{"name": "name1"}' 
        }; 
 
        try {
            await putContactUsHandler(event);
        } catch (error) {
            expect(error).toBeInstanceOf(Error);
            expect(error).toHaveProperty('message', returnedError);
        }
        expect.assertions(2);

    }); 

    it('should validate the name and respond with failure if it is not a string', async () => { 

        const returnedError = 'invalid name: 1234'; 

        const event = { 
            httpMethod: 'POST', 
            body: '{"name": 1234,"phone": "3141112222", "email": "XXXXXXXXXXXXXX", "description": "Need password reset"}' 
        }; 
     
        try {
            await putContactUsHandler(event);
        } catch (error) {
            expect(error).toBeInstanceOf(Error);
            expect(error).toHaveProperty('message', returnedError);
        }
    });

    it('should validate the phone and respond with failure if it is not valid', async () => { 

        const returnedError = 'invalid phone: 314512'; 

        const event = { 
            httpMethod: 'POST', 
            body: '{"name": "testname", "phone": "314512", "email": "XXXXXXXXXXXXXX", "description": "Need password reset"}' 
        }; 
     
        try {
            await putContactUsHandler(event);
        } catch (error) {
            expect(error).toBeInstanceOf(Error);
            expect(error).toHaveProperty('message', returnedError);
        }
    });

    it('should validate the email and respond with failure if it is not valid', async () => { 

        const returnedError = 'invalid email: XXXXXXXXXXXXXX'; 

        const event = { 
            httpMethod: 'POST', 
            body: '{"name": "testname","phone": "3141112222", "email": "XXXXXXXXXXXXXX", "description": "Need password reset"}' 
        }; 
     
        try {
            await putContactUsHandler(event);
        } catch (error) {
            expect(error).toBeInstanceOf(Error);
            expect(error).toHaveProperty('message', returnedError);
        }
    });

    it('should validate the description and respond with failure if it is not valid', async () => { 

        const returnedError = 'invalid description: Need';

        const event = { 
            httpMethod: 'POST', 
            body: '{"name": "testname","phone": "3141112222", "email": "test@gmail.com", "description": "Need"}' 
        }; 
     
        try {
            await putContactUsHandler(event);
        } catch (error) {
            expect(error).toBeInstanceOf(Error);
            expect(error).toHaveProperty('message', returnedError);
        }
    });

    it('Validated request processes successfully', async () => { 
        const returnedItem = '{ "result": "Success"}';

        sesMock.on(SendEmailCommand).resolves({
            returnedItem
        }); 
 
        const event = { 
            httpMethod: 'POST', 
            body: '{"name": "test","phone": "3141112222", "email": "test@gmail.com", "description": "Need password reset"}'
        }; 
     
        const result = await putContactUsHandler(event); 
        
        const expectedResult = { 
            headers: {
                "Content-Type": "application/json",
            },
            isBase64Encoded: false,
            statusCode: 200, 
            body: returnedItem
        }; 

        expect(result).toEqual(expectedResult);
    }); 

}); 
 