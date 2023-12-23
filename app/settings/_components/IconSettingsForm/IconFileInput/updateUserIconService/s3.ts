import type { PutObjectCommandInput } from "@aws-sdk/client-s3";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";

import { env } from "@/_shared/utils/env";

const client = new S3Client({
  region: "ap-northeast-1",
  endpoint: env.UNSOCIAL_S3_ENDPOINT,
  credentials: {
    accessKeyId: env.UNSOCIAL_S3_ACCESS_KEY_ID,
    secretAccessKey: env.UNSOCIAL_S3_SECRET_ACCESS_KEY,
  },
  forcePathStyle: true,
});

export const putObject = (
  input: Pick<PutObjectCommandInput, "Key" | "Body">,
) => {
  return client.send(
    new PutObjectCommand({
      Bucket: env.UNSOCIAL_S3_BUCKET,
      ...input,
    }),
  );
};
