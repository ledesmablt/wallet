import { v1 as uuidv1 } from "uuid";
import * as dynamoDbLib from "./../libs/dynamodb-lib";
import { success, failure } from "./../libs/response-lib";


export async function create(event) {
  const data = JSON.parse(event.body);
  const params = {
    TableName: process.env.categoryTable,
    Item: {
      userId: "default", // will integrate with cognito eventually
      categoryId: uuidv1(),
      categoryName: data.categoryName,
      createTime: Date.now()
    }
  };

  try {
    await dynamoDbLib.call("put", params);
    return success(params.Item);
  } catch (e) {
    console.error(e);
    return failure({ status: false });
  }
};

export async function list(event) {
  // const data = JSON.parse(event.body);
  const params = {
    TableName: process.env.categoryTable,
    KeyConditionExpression: "userId = :userId",
    ExpressionAttributeValues: {
      ":userId": "default",
    }
  };

  try {
    const result = await dynamoDbLib.call("query", params);
    return success(result.Items);
  } catch (e) {
    console.error(e);
    return failure({ status: false });
  }
}