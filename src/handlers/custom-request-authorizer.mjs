import { SecretsManagerClient, GetSecretValueCommand } from "@aws-sdk/client-secrets-manager";
const STACK_REGION = process.env.STACK_REGION;
const X_ORIGIN_VERIFY_SECRET_ARN = process.env.X_ORIGIN_VERIFY_SECRET_ARN;
const sm_client = new SecretsManagerClient({ region: STACK_REGION });

//reference: https://docs.aws.amazon.com/apigateway/latest/developerguide/apigateway-use-lambda-authorizer.html

export const customRequestAuthorizerHandler = async (event) => {
    //log the request event
    console.log('Received event:', JSON.stringify(event, null, 2));
    
    //get the secret value from Secrets Manager
    const sm_command = new GetSecretValueCommand({ 
        SecretId: X_ORIGIN_VERIFY_SECRET_ARN
    });

    //verify the token
    try {
        let sm_response = await sm_client.send(sm_command);

        if (event.headers["x-origin-verify"] === sm_response.SecretString) {
            return generateAllow('authenticated', event.methodArn);
        } else {
            return generateDeny('unauthenticated', event.methodArn);
        }
    }
    catch (error) {
        return "Invalid token";
    }
}

//generate the policy
var generatePolicy = function(principalId, effect, resource) {
    var authResponse = {};
    authResponse.principalId = principalId;
    if (effect && resource) {
        var policyDocument = {};
        policyDocument.Version = '2012-10-17'; 
        policyDocument.Statement = [];
        var statementOne = {};
        statementOne.Action = 'execute-api:Invoke';
        statementOne.Effect = effect;
        statementOne.Resource = resource;
        policyDocument.Statement[0] = statementOne;
        authResponse.policyDocument = policyDocument;
    }
    return authResponse;
}

//generate allow
var generateAllow = function(principalId, resource) {
    return generatePolicy(principalId, 'Allow', resource);
}

//generate deny
var generateDeny = function(principalId, resource) {
    return generatePolicy(principalId, 'Deny', resource);
}