import { S3Event } from "aws-lambda";
import { S3 } from "aws-sdk";
import * as csvParser from "csv-parser";

const s3Client = new S3({ region: process.env.AWS_REGION });

export async function handler(event: S3Event): Promise<void> {
  try {
    for (const fileRecord of event.Records) {
      const sourceBucket = fileRecord.s3.bucket.name;
      const sourceKey = fileRecord.s3.object.key;

      if (!sourceKey.endsWith(".csv")) {
        console.warn("Unsupported file type. Only .csv files are allowed.");
        continue;
      }

      const fileStream = s3Client
        .getObject({
          Bucket: sourceBucket,
          Key: sourceKey,
        })
        .createReadStream();

      const parsedData: Record<string, string>[] = [];

      await new Promise((resolve, reject) => {
        fileStream
          .pipe(csvParser())
          .on("data", (record: Record<string, string>) => {
            console.log("Parsed record:", JSON.stringify(record));
            parsedData.push(record);
          })
          .on("end", resolve)
          .on("error", reject);
      });

      const destinationKey = sourceKey.replace("uploaded/", "processed/");
      await s3Client
        .copyObject({
          Bucket: sourceBucket,
          CopySource: `${sourceBucket}/${sourceKey}`,
          Key: destinationKey,
        })
        .promise();

      await s3Client
        .deleteObject({
          Bucket: sourceBucket,
          Key: sourceKey,
        })
        .promise();
    }
  } catch (error) {
    console.error("[parseFileLambda] Error occurred:", error);
  }
}
