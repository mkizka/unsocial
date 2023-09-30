import crypto from "crypto";

import { env } from "@/utils/env";

import { createDigest, textOf } from "./utils";

const getSignature = (textToSign: string, privateKey: string) => {
  const sig = crypto.createSign("sha256").update(textToSign).end();
  return sig.sign(privateKey, "base64");
};

export type SignActivityParams = {
  signer: {
    id: string;
    privateKey: string;
  };
  body: string;
  inboxUrl: URL;
};

export const signHeaders = ({ signer, body, inboxUrl }: SignActivityParams) => {
  const order = ["(request-target)", "host", "date", "digest"];
  const headers = {
    host: inboxUrl.host,
    date: new Date().toUTCString(),
    digest: `SHA-256=${createDigest(body)}`,
  };
  const textToSign = textOf({
    pathname: inboxUrl.pathname,
    headers,
    order,
  });
  const signature = getSignature(textToSign, signer.privateKey);
  return {
    ...headers,
    signature:
      `keyId="https://${env.HOST}/users/${signer.id}/activity#main-key",` +
      `algorithm="rsa-sha256",` +
      `headers="${order.join(" ")}",` +
      `signature="${signature}"`,
  };
};
