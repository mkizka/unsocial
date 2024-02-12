import crypto from "crypto";

import { createDigest, textOf } from "@/_shared/activitypub/httpSignatureUtils";
import { env } from "@/_shared/utils/env";

const getSignature = (textToSign: string, privateKey: string) => {
  const sig = crypto.createSign("sha256").update(textToSign).end();
  return sig.sign(privateKey, "base64");
};

export type Signer = {
  id: string;
  privateKey: string;
};

export type SignActivityParams = {
  signer: Signer;
  body: string;
  inboxUrl: URL;
  method: string;
};

// TODO: Requestオブジェクトを受け取るようにする
export const signHeaders = ({
  signer,
  body,
  inboxUrl,
  method,
}: SignActivityParams) => {
  const order = [
    "(request-target)",
    "host",
    "date",
    method === "POST" ? "digest" : "accept",
  ];
  const headers = {
    host: inboxUrl.host,
    date: new Date().toUTCString(),
    digest: `SHA-256=${createDigest(body)}`,
    accept: "application/activity+json",
  };
  const textToSign = textOf({
    method,
    pathname: inboxUrl.pathname,
    headers,
    order,
  });
  const signature = getSignature(textToSign, signer.privateKey);
  return {
    ...headers,
    signature:
      `keyId="https://${env.UNSOCIAL_HOST}/users/${signer.id}/activity#main-key",` +
      `algorithm="rsa-sha256",` +
      `headers="${order.join(" ")}",` +
      `signature="${signature}"`,
  };
};
