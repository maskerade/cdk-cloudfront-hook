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

    const edgeLambdaViewerRequest = new cloudfront.experimental.EdgeFunction(this, 'EdgeLambdaViewerRequest', {
      runtime: lambda.Runtime.NODEJS_14_X,
      handler: 'index.handler',
      code: new lambda.AssetCode("src/edge-lambda-request")
    });

    // Create SSM Param used by
    const ssmParam = new ssm.StringParameter(this, 'EdgeLambdaArn', {
      parameterName: "EdgeLambdaArn",
      stringValue: edgeLambdaViewerRequest.edgeArn,
    });


    const cloudFrontDistribution = new cloudfront.Distribution(this, 'distro', {
      defaultBehavior: {
        origin: s3Origin,
        edgeLambdas: [
          {
            functionVersion: edgeLambdaViewerRequest.currentVersion,
            eventType: cloudfront.LambdaEdgeEventType.VIEWER_REQUEST,
          }
        ],
      },
    });

    cloudFrontDistribution.addBehavior('testpath', s3Origin, {
      edgeLambdas: [
        {
          functionVersion: edgeLambdaViewerRequest.currentVersion,
          eventType: cloudfront.LambdaEdgeEventType.ORIGIN_REQUEST,
        },
      ],
    } )

    // Test using {{resolve:ssm:<param-name>:<param-version>}}
    // const cfnDistro = cloudFrontDistribution.node.defaultChild as cloudfront.CfnDistribution
    // cfnDistro.addPropertyOverride("DistributionConfig.Comment", "{{resolve:ssm:MyParameter:1}}");

  }
}
