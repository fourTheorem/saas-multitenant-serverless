import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { QueryCommand } from '@aws-sdk/lib-dynamodb';

export async function handler(event) {
  const context = event.requestContext.authorizer.lambda;

  const ddbClient = new DynamoDBClient({
    credentials: context.credentials,
  });

  try {
    const response = await ddbClient.send(new QueryCommand({
      TableName: 'saas-products-dev',
      KeyConditionExpression: 'tenant = :tenant',
      ExpressionAttributeValues: {
        ':tenant': context.tenant,
      },
    }));

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        products: response.Items,
      }),
    };
  } catch (error) {
    return {
      statusCode: 400,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: 'Error',
        error,
      }),
    };
  }
}