import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';

import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins';
import * as ssm from 'aws-cdk-lib/aws-ssm';

export class CdkCloudfrontHookStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    // Adding an existing Lambda@Edge function created in a different stack
    // to a CloudFront distribution.
    const s3Bucket = new s3.Bucket(this, 'myBucket');
    const s3Origin = new origins.S3Origin(s3Bucket)
    const functionVersion = lambda.Version.fromVersionArn(this, 'Version', 'arn:aws:lambda:us-east-1:123456789012:function:functionName:1');
    const functionVersion2 = lambda.Version.fromVersionArn(this, 'Version2', ssm.StringParameter.valueForStringParameter(this, `MyParameter`));

    const cloudFrontDistribution = new cloudfront.Distribution(this, 'distro', {
      defaultBehavior: {
        origin: s3Origin,
        edgeLambdas: [
          {
            functionVersion,
            eventType: cloudfront.LambdaEdgeEventType.VIEWER_REQUEST,
          },
          {
            functionVersion: functionVersion2,
            eventType: cloudfront.LambdaEdgeEventType.VIEWER_RESPONSE,
          },
        ],
      },
    });

    cloudFrontDistribution.addBehavior('testpath', s3Origin, {
      edgeLambdas: [
        {
          functionVersion,
          eventType: cloudfront.LambdaEdgeEventType.VIEWER_REQUEST,
        },
        {
          functionVersion: functionVersion2,
          eventType: cloudfront.LambdaEdgeEventType.VIEWER_RESPONSE,
        },
      ],
    } )




  }
}
