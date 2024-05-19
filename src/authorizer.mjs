import { STSClient, AssumeRoleCommand } from '@aws-sdk/client-sts';
import { AuthPolicy } from 'aws-api-auth-policy';
import jwt from 'jsonwebtoken';
import JwksRsa from 'jwks-rsa';

const REGION = process.env.AWS_REGION;
const COGNITO_USER_POOL_ID = process.env.COGNITO_USER_POOL_ID;
const ASSUME_ROLE_ARN = process.env.ASSUME_ROLE_ARN
const PRODUCTS_TABLE_ARN = process.env.PRODUCTS_TABLE_ARN;
const BEARER_TOKEN_PATTERN = /^Bearer[ ]+([^ ]+)[ ]*$/i;

const stsClient = new STSClient();
const jwksClient = JwksRsa({
  jwksUri: `https://cognito-idp.${REGION}.amazonaws.com/${COGNITO_USER_POOL_ID}/.well-known/jwks.json`,
});

export async function handler(event, context) {
  console.log('event: ', event);

  const accessToken = extractAccessToken(event.headers);
  const claims = await validateJwt(jwksClient, accessToken);

  const session = await stsClient.send(new AssumeRoleCommand({
    RoleArn: ASSUME_ROLE_ARN,
    RoleSessionName: 'authorizer-session',
    DurationSeconds: 900,
    Policy: JSON.stringify({
      Version: '2012-10-17',
      Statement: [
        {
          Effect: 'Allow',
          Action: [
            'dynamodb:Query',
          ],
          Resource: PRODUCTS_TABLE_ARN,
          Condition: {
            'ForAllValues:StringEquals': {
              'dynamodb:LeadingKeys': [
                '${aws:PrincipalTag/TenantId}',
              ],
            },
          },
        },
      ],
    }),
    Tags: [
      {
        Key: 'TenantId',
        Value: claims['custom:tenant'],
      },
    ],
  }));

  const authPolicy = new AuthPolicy(claims.email, event.requestContext.accountId, {
    region: REGION,
    restApiId: event.requestContext.apiId,
  });

  authPolicy.allowMethod(authPolicy.HttpVerb.GET, '/');

  return {
    ...authPolicy.build(),
    context: {
      tenant: claims['custom:tenant'],
      credentials: {
        accessKeyId: session.Credentials.AccessKeyId,
        secretAccessKey: session.Credentials.SecretAccessKey,
        sessionToken: session.Credentials.SessionToken,
      },
    },
  };
}

function extractAccessToken(headers) {
  if (headers?.authorization) {
    const result = BEARER_TOKEN_PATTERN.exec(headers.authorization);

    if (result) {
      return result[1];
    }
  }

  throw new Error('Invalid access token');
}

function getSigningKey(client) {
  return function getKey(header, callback) {
    client.getSigningKey(header.kid, (error, key) => {
      callback(error, key?.getPublicKey());
    });
  };
}

async function validateJwt(client, token) {
  return new Promise((resolve, reject) => {
    jwt.verify(token, getSigningKey(client), (error, data) => {
      if (error) {
        return reject('Unauthorized');
      }

      if (!data['custom:tenant']) {
        return reject('No tenant information found in token');
      }

      return resolve(data);
    });
  });
}
