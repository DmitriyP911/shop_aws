import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { S3 } from "aws-sdk";

const s3Client = new S3({ region: process.env.AWS_REGION });
const targetBucket = process.env.BUCKET_NAME || "";

const responseHeaders = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
};

export async function handler(
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> {
  console.log("[generateSignedUrl] Event data:", JSON.stringify(event));

  try {
    const fileName = event.queryStringParameters?.name;

    if (!fileName) {
      return {
        statusCode: 400,
        headers: responseHeaders,
        body: JSON.stringify({ message: "File name is required" }),
      };
    }

    if (!fileName.endsWith(".csv")) {
      return {
        statusCode: 400,
        headers: responseHeaders,
        body: JSON.stringify({
          message: "Invalid file type. Only .csv files are supported",
        }),
      };
    }

    const presignedUrl = await s3Client.getSignedUrlPromise("putObject", {
      Bucket: targetBucket,
      Key: `incoming/${fileName}`,
      Expires: 300,
      ContentType: "text/csv",
    });

    return {
      statusCode: 200,
      headers: responseHeaders,
      body: JSON.stringify({ signedUrl: presignedUrl }),
    };
  } catch (error) {
    console.error("[generateSignedUrl] Error encountered:", error);

    return {
      statusCode: 500,
      headers: responseHeaders,
      body: JSON.stringify({ message: "Internal Server Error" }),
    };
  }
}
