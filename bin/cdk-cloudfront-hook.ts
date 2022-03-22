#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { CdkCloudfrontHookStack } from '../lib/cdk-cloudfront-hook-stack';

const app = new cdk.App();
new CdkCloudfrontHookStack(app, 'CdkCloudfrontHookStack', {
  // env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: process.env.CDK_DEFAULT_REGION },
  env: { account: '123412341234', region: 'us-east-1' }
});