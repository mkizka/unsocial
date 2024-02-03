import type { PutObjectCommandInput } from "@aws-sdk/client-s3";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";

import { env } from "@/_shared/utils/env";

const client = new S3Client({
  region: env.UNSOCIAL_AWS_REGION,
  endpoint: env.UNSOCIAL_AWS_ENDPOINT,
  credentials: {
    accessKeyId: env.UNSOCIAL_AWS_ACCESS_KEY_ID,
    secretAccessKey: env.UNSOCIAL_AWS_SECRET_ACCESS_KEY,
  },
  forcePathStyle: true,
});

export const putObject = (input: Omit<PutObjectCommandInput, "Bucket">) => {
  return client.send(
    new PutObjectCommand({
      Bucket: env.UNSOCIAL_AWS_BUCKET,
      ...input,
    }),
  );
};
