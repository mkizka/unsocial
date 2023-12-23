import crypto from "crypto";
import sharp from "sharp";

import { env } from "@/_shared/utils/env";
import { getIconHash } from "@/_shared/utils/icon";
import { prisma } from "@/_shared/utils/prisma";

import * as s3 from "./s3";

const convertToPng = async (file: File) => {
  const image = sharp(await file.arrayBuffer());
  return image.png().toBuffer();
};

const getIconUrl = (key: string) => {
  return `${env.UNSOCIAL_S3_ENDPOINT}/${env.UNSOCIAL_S3_BUCKET}/${key}`;
};

export const update = async (userId: string, file: File) => {
  const key = `icons/${crypto.randomUUID()}.png`;
  await s3.putObject({
    Key: key,
    Body: await convertToPng(file),
  });
  const icon = getIconUrl(key);
  const iconHash = getIconHash(icon);
  await prisma.user.update({
    where: { id: userId },
    data: { icon, iconHash },
  });
};
