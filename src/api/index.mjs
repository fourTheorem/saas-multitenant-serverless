import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { QueryCommand } from '@aws-sdk/lib-dynamodb';

export async function handler(event, context) {
  console.log('event: ', event);

  const credentials = event.requestContext.authorizer.lambda.credentials;
  const tenant = event.queryStringParameters.tenant ?? 'default';

  const ddbClient = new DynamoDBClient({
    credentials: {
      accessKeyId: credentials.AccessKeyId,
      secretAccessKey: credentials.SecretAccessKey,
      sessionToken: credentials.SessionToken,
    },
  });

  try {
    const response = await ddbClient.send(new QueryCommand({
      TableName: 'saas-products-dev',
      KeyConditionExpression: 'tenant = :tenant',
      ExpressionAttributeValues: {
        ':tenant': tenant,
      },
    }));

    return {
      statusCode: 200,
      body: JSON.stringify({
        tenant,
        message: 'Hello World',
        products: response.Items,
      }),
    };
  } catch (error) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        tenant,
        message: 'Error',
        error: error,
      }),
    };
  }
}