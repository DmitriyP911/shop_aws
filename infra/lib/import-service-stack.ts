import {
  aws_s3,
  RemovalPolicy,
  aws_s3_deployment,
  CfnOutput,
  Stack,
  Duration,
  aws_s3_notifications,
  aws_sqs as sqs,
} from "aws-cdk-lib";
import * as apigateway from "aws-cdk-lib/aws-apigateway";
import * as lambda from "aws-cdk-lib/aws-lambda";
import { Construct } from "constructs";
import path = require("path");

export class ImportServiceStack extends Stack {
  constructor(scope: Construct, id: string) {
    super(scope, id);

    const importBucket = new aws_s3.Bucket(this, "ImportServiceBucket", {
      autoDeleteObjects: true,
      blockPublicAccess: aws_s3.BlockPublicAccess.BLOCK_ALL,
      removalPolicy: RemovalPolicy.DESTROY,
      cors: [
        {
          allowedOrigins: ["*"],
          allowedMethods: [aws_s3.HttpMethods.PUT],
          allowedHeaders: ["*"],
        },
      ],
    });

    new aws_s3_deployment.BucketDeployment(this, "UploadFolderDeployment", {
      destinationBucket: importBucket,
      destinationKeyPrefix: "uploaded/",
      sources: [
        aws_s3_deployment.Source.data(
          ".placeholder",
          "This is a placeholder file"
        ),
      ],
    });

    new CfnOutput(this, "ImportServiceBucketName", {
      value: importBucket.bucketName,
      description: "The name of the S3 bucket",
      exportName: "ImportServiceBucketName",
    });

    const api = new apigateway.RestApi(this, "import-api", {
      restApiName: "My Import API Gateway",
      description: "This API serves the Import Lambda functions.",
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: apigateway.Cors.ALL_METHODS,
      },
    });

    const importResource = api.root.addResource("import");

    const importProductsFileLambda = new lambda.Function(
      this,
      "importProductsFile",
      {
        runtime: lambda.Runtime.NODEJS_20_X,
        memorySize: 128,
        timeout: Duration.seconds(5),
        handler: "importProductsFile.handler",
        code: lambda.Code.fromAsset(path.join(__dirname, "./import")),
        environment: {
          BUCKET_NAME: importBucket.bucketName,
        },
      }
    );
    const importProductsFileLambdaIntegration =
      new apigateway.LambdaIntegration(importProductsFileLambda);
    importResource.addMethod("GET", importProductsFileLambdaIntegration);
    importBucket.grantPut(importProductsFileLambda);

    const catalogItemsQueue = new sqs.Queue(this, "catalogItemsQueue", {
      visibilityTimeout: Duration.seconds(30),
    });

    const importFileParserLambda = new lambda.Function(
      this,
      "importFileParser",
      {
        runtime: lambda.Runtime.NODEJS_20_X,
        memorySize: 128,
        timeout: Duration.seconds(5),
        handler: "handler.importFileParser",
        code: lambda.Code.fromAsset(path.join(__dirname, "./product-sqs")),
        environment: {
          QUEUE_URL: catalogItemsQueue.queueUrl,
        },
      }
    );

    importBucket.addEventNotification(
      aws_s3.EventType.OBJECT_CREATED,
      new aws_s3_notifications.LambdaDestination(importFileParserLambda),
      { prefix: "uploaded/" }
    );

    importBucket.grantReadWrite(importFileParserLambda);
    catalogItemsQueue.grantSendMessages(importFileParserLambda);
  }
}
