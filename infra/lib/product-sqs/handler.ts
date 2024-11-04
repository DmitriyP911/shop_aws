import { SQSEvent, S3Event } from "aws-lambda";
import { DynamoDB, SQS, S3 } from "aws-sdk";
import { SNS } from "aws-sdk";
const csv = require("csv-parser");

const dynamodb = new DynamoDB.DocumentClient();
const sns = new SNS();

const TABLE_NAME = process.env.TABLE_NAME!;
const SNS_TOPIC_ARN = process.env.SNS_TOPIC_ARN!;

export async function catalogBatchProcess(event: SQSEvent) {
  const productPromises = event.Records.map(async (record) => {
    const product = JSON.parse(record.body);
    await dynamodb
      .put({
        TableName: TABLE_NAME,
        Item: product,
      })
      .promise();
  });

  await Promise.all(productPromises);

  await sns
    .publish({
      TopicArn: SNS_TOPIC_ARN,
      Message: "Batch of products created successfully",
    })
    .promise();
}

const s3 = new S3();
const sqs = new SQS();
const QUEUE_URL = process.env.QUEUE_URL!;

export async function importFileParser(event: S3Event) {
  const records: any = [];
  for (const record of event.Records) {
    const stream = s3
      .getObject({
        Bucket: record.s3.bucket.name,
        Key: record.s3.object.key,
      })
      .createReadStream();

    await new Promise((resolve: any, reject) => {
      stream
        .pipe(csv())
        .on("data", (data: any) => records.push(data))
        .on("end", async () => {
          for (const item of records) {
            await sqs
              .sendMessage({
                QueueUrl: QUEUE_URL,
                MessageBody: JSON.stringify(item),
              })
              .promise();
          }
          resolve();
        })
        .on("error", reject);
    });
  }
}
