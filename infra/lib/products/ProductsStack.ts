import { Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as cdk from "aws-cdk-lib";
import * as apigateway from "aws-cdk-lib/aws-apigateway";
import { join } from "path";

const ProductsTableName = "MyProducts";
const StockTableName = "MyStock";

export class ProductsStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const productsTable = new dynamodb.Table(this, "MyProducts", {
      tableName: ProductsTableName,
      partitionKey: { name: "id", type: dynamodb.AttributeType.STRING },
    });

    const stockTable = new dynamodb.Table(this, "MyStock", {
      tableName: StockTableName,
      partitionKey: { name: "product_id", type: dynamodb.AttributeType.STRING },
    });

    const createProductLambda = new lambda.Function(this, "createMyProduct", {
      runtime: lambda.Runtime.NODEJS_20_X,
      memorySize: 1024,
      timeout: cdk.Duration.seconds(5),
      handler: "handlers.createProduct",
      code: lambda.Code.fromAsset(join(__dirname, "./")),
      environment: {
        PRODUCTS_TABLE_NAME: ProductsTableName,
        STOCK_TABLE_NAME: StockTableName,
      },
    });

    const getProductsListLambda = new lambda.Function(
      this,
      "getMyProductsList",
      {
        runtime: lambda.Runtime.NODEJS_20_X,
        memorySize: 1024,
        timeout: cdk.Duration.seconds(5),
        handler: "handlers.getProductsList",
        code: lambda.Code.fromAsset(join(__dirname, "./")),
        environment: {
          PRODUCTS_TABLE_NAME: ProductsTableName,
          STOCK_TABLE_NAME: StockTableName,
        },
      }
    );

    const getProductByIdLambda = new lambda.Function(this, "getMyProductById", {
      runtime: lambda.Runtime.NODEJS_20_X,
      memorySize: 1024,
      timeout: cdk.Duration.seconds(5),
      handler: "handlers.getProductById",
      code: lambda.Code.fromAsset(join(__dirname, "./")),
      environment: {
        PRODUCTS_TABLE_NAME: ProductsTableName,
        STOCK_TABLE_NAME: StockTableName,
      },
    });

    productsTable.grantReadWriteData(createProductLambda);
    stockTable.grantReadWriteData(createProductLambda);
    productsTable.grantReadData(getProductsListLambda);
    stockTable.grantReadData(getProductsListLambda);
    productsTable.grantReadData(getProductByIdLambda);
    stockTable.grantReadData(getProductByIdLambda);

    const api = new apigateway.RestApi(this, "ProductApi");

    const products = api.root.addResource("products");
    products.addMethod(
      "POST",
      new apigateway.LambdaIntegration(createProductLambda)
    );
    products.addMethod(
      "GET",
      new apigateway.LambdaIntegration(getProductsListLambda)
    );

    const product = products.addResource("{productId}");
    product.addMethod(
      "GET",
      new apigateway.LambdaIntegration(getProductByIdLambda)
    );
  }
}
