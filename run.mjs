import { STSClient, GetCallerIdentityCommand, AssumeRoleCommand } from '@aws-sdk/client-sts';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { QueryCommand } from '@aws-sdk/lib-dynamodb';

const stsClient = new STSClient({
  region: 'eu-west-1'
});

// console.log(await stsClient.send(new GetCallerIdentityCommand({})));

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

// console.log(response);
const credentials = response.Credentials;

const ddbClient = new DynamoDBClient({
  region: 'eu-west-1',
  credentials: {
    accessKeyId: credentials.AccessKeyId,
    secretAccessKey: credentials.SecretAccessKey,
    sessionToken: credentials.SessionToken,
  },
});

try {
  const result = await ddbClient.send(new QueryCommand({
    TableName: 'saas-products-dev',
    KeyConditionExpression: 'tenant = :tenant',
    ExpressionAttributeValues: {
      ':tenant': 'test',
    },
  }));

  console.log(result.Items);
} catch (error) {
  console.error(error.toString());
}