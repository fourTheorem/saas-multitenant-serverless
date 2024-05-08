import { STSClient, AssumeRoleCommand } from '@aws-sdk/client-sts';

const stsClient = new STSClient({ region: 'eu-west-1' });

export async function handler(event, context) {
  console.log('event: ', event);

  const response = await stsClient.send(new AssumeRoleCommand({
    RoleArn: 'arn:aws:iam::629383401309:role/authorizer-access-role',
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
          Resource: 'arn:aws:dynamodb:eu-west-1:629383401309:table/saas-products-dev',
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
        Value: 'chicken',
      },
    ],
  }));

  console.log(response);

  return {
    ...generatePolicy('user', 'Allow', '*'),
    context: {
      credentials: response.Credentials,
    },
  };

  // return generatePolicy('user', 'Allow', 'arn:aws:execute-api:eu-west-1:665863320777:*/*');
}

const generatePolicy = (principalId, effect, resource) => {
  const authResponse = {};
  authResponse.principalId = principalId;
  if (effect && resource) {
    const policyDocument = {};
    policyDocument.Version = '2012-10-17';
    policyDocument.Statement = [];
    const statementOne = {};
    statementOne.Action = 'execute-api:Invoke';
    statementOne.Effect = effect;
    statementOne.Resource = resource;
    policyDocument.Statement[0] = statementOne;
    authResponse.policyDocument = policyDocument;
  }
  return authResponse;
};
