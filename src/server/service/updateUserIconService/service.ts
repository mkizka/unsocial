import crypto from "crypto";
import sharp from "sharp";

import { s3Repository, userRepository } from "@/server/repository";
import { env } from "@/utils/env";
import { getIconHash } from "@/utils/getIconHash";

const convertToPng = async (file: File) => {
  const image = sharp(await file.arrayBuffer());
  return image.png().toBuffer();
};

const getIconUrl = (key: string) => {
  return `${env.AWS_ENDPOINT}/${env.AWS_BUCKET}/${key}`;
};

export const update = async (userId: string, file: File) => {
  const key = `icons/${crypto.randomUUID()}.png`;
  await s3Repository.putObject({
    Key: key,
    Body: await convertToPng(file),
  });
  const icon = getIconUrl(key);
  const iconHash = getIconHash(icon);
  await userRepository.updateIcon({
    userId,
    icon,
    iconHash,
  });
};
