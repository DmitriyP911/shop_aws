#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import { StartLambdaStack } from "../lib/start-lambda-stack";

const app = new cdk.App();
new StartLambdaStack(app, "StartLambdaStack", {});
