import * as cdk from "aws-cdk-lib";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as path from "path";
import { Construct } from "constructs";
import * as apigateway from "aws-cdk-lib/aws-apigateway";

// import * as sqs from 'aws-cdk-lib/aws-sqs';

export class StartLambdaStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const api = new apigateway.RestApi(this, "my-api", {
      restApiName: "My API Gateway",
      description: "This API serves the Lambda functions.",
    });

    // GET PRODUCTS

    const getProductsList = new lambda.Function(this, "get-products-list", {
      runtime: lambda.Runtime.NODEJS_20_X,
      memorySize: 1024,
      timeout: cdk.Duration.seconds(5),
      handler: "handler.getProducts",
      code: lambda.Code.fromAsset(path.join(__dirname, "./")),
    });

    const getProductsListIntegration = new apigateway.LambdaIntegration(
      getProductsList,
      {
        integrationResponses: [{ statusCode: "200" }],
        proxy: false,
      }
    );

    const getProductsListResource = api.root.addResource("products");

    getProductsListResource.addMethod("GET", getProductsListIntegration, {
      methodResponses: [{ statusCode: "200" }],
    });

    getProductsListResource.addCorsPreflight({
      allowOrigins: ["https://dpfus0454sdas.cloudfront.net"],
      allowMethods: ["GET"],
    });

    // GET PRODUCT BY ID

    const getProductById = new lambda.Function(this, "get-product-by-id", {
      runtime: lambda.Runtime.NODEJS_20_X,
      memorySize: 1024,
      timeout: cdk.Duration.seconds(5),
      handler: "handler.getProductById",
      code: lambda.Code.fromAsset(path.join(__dirname, "./")),
    });

    const getProductByIdIntegration = new apigateway.LambdaIntegration(
      getProductById,
      {
        integrationResponses: [{ statusCode: "200" }],
        proxy: false,
      }
    );

    const getProductByIdResource = getProductsListResource.addResource("{id}");

    getProductByIdResource.addMethod("GET", getProductByIdIntegration, {
      methodResponses: [{ statusCode: "200" }],
    });

    getProductByIdResource.addCorsPreflight({
      allowOrigins: ["https://dpfus0454sdas.cloudfront.net"],
      allowMethods: ["GET"],
    });
  }
}
