import { customRequestAuthorizerHandler } from '../../../src/handlers/custom-request-authorizer.mjs';
import { SecretsManagerClient, GetSecretValueCommand } from "@aws-sdk/client-secrets-manager";
import { mockClient } from "aws-sdk-client-mock";

describe('Test customRequestAuthorizerHandler ', function () { 
    const smMock = mockClient(SecretsManagerClient);
    const X_ORIGIN_VERIFY_SECRET_ARN = "arn:aws:secretsmanager:us-east-2:1112223334:secret:x-origin-verify";

    beforeEach(() => {
        smMock.reset();
        process.env.X_ORIGIN_VERIFY_SECRET_ARN = X_ORIGIN_VERIFY_SECRET_ARN;
    });
 
    it('authorizer should generate invalid token error', async () => { 

        smMock.on(GetSecretValueCommand).resolves({ SecretString: "validsecretvalue"}); 

        const event = { type: "REQUEST", httpMethod: "GET" };

        const result = await customRequestAuthorizerHandler(event); 

        expect(result).toEqual("Invalid token");

    }); 

    it('authorizer should generate successful allow policy', async () => { 

        smMock.on(GetSecretValueCommand).resolves({ SecretString: "validsecretvalue"}); 

        const event = { type: "REQUEST", httpMethod: "GET", headers: { "x-origin-verify": "validsecretvalue"}};   

        const result = await customRequestAuthorizerHandler(event); 

        const expectedResult = { 
            principalId: "authenticated"
        }; 

        expect(result).toEqual(expectedResult);

    }); 

    it('authorizer should generate successful deny policy', async () => { 

        smMock.on(GetSecretValueCommand).resolves({ SecretString: "none"}); 

        const event = { type: "REQUEST", httpMethod: "GET", headers: { "x-origin-verify": "validsecretvalue"}};   

        const result = await customRequestAuthorizerHandler(event); 

        const expectedResult = { 
            principalId: "unauthenticated"
        }; 

        expect(result).toEqual(expectedResult);

    }); 
    
}); 
 