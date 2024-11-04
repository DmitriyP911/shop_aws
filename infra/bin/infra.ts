#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import "source-map-support/register";
// import { ProductsStack } from "../lib/products/ProductsStack";
// import { ImportServiceStack } from "../lib/import-service-stack";
// import { DeployWebAppStack } from "../lib/deploy-web-app-stack";
import { ProductSqsStack } from "../lib/product-sqs/product-sqs-stack";

const app = new cdk.App();
// new ProductsStack(app, "MyProductsStack");
// new ImportServiceStack(app, "ImportServiceStack");
// new DeployWebAppStack(app, "DeployWebAppStack", {});
new ProductSqsStack(app, "ProductSqsStack");
