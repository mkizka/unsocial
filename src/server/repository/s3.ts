import type { PutObjectCommandInput } from "@aws-sdk/client-s3";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";

import { env } from "@/utils/env";

const client = new S3Client({
  region: "ap-northeast-1",
  endpoint: env.AWS_ENDPOINT,
  credentials: {
    accessKeyId: env.AWS_ACCESS_KEY_ID,
    secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
  },
  forcePathStyle: true,
});

export const putObject = (
  input: Pick<PutObjectCommandInput, "Key" | "Body">,
) => {
  return client.send(
    new PutObjectCommand({
      Bucket: env.AWS_BUCKET,
      ...input,
    }),
  );
};
