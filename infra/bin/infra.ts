#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import "source-map-support/register";
import { ProductsStack } from "../lib/products/ProductsStack";
import { DeployWebAppStack } from "../lib/deploy-web-app-stack";

const app = new cdk.App();
new ProductsStack(app, "MyProductsStack");
// new DeployWebAppStack(app, "DeployWebAppStack", {});
