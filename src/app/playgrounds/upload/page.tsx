import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";

import { env } from "@/utils/env";
import { fetcher } from "@/utils/fetcher";

export default async function Page() {
  console.log(env);
  const client = new S3Client({
    region: "ap-northeast-1",
    endpoint: env.AWS_ENDPOINT,
    credentials: {
      accessKeyId: env.AWS_ACCESS_KEY_ID,
      secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
    },
    forcePathStyle: true,
  });
  const image = await fetcher("https://github.com/mkizka.png");
  if (image instanceof Error) throw image;
  const res = await client.send(
    new PutObjectCommand({
      Bucket: env.AWS_BUCKET,
      Key: "mkizka.png",
      Body: Buffer.from(await image.arrayBuffer()),
    }),
  );
  console.log(res);
  return (
    <div>
      <img src="http://localhost:9000/unsocial/mkizka.png" alt="" />
    </div>
  );
}
