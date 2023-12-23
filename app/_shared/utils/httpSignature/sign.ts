import crypto from "crypto";

import { env } from "@/_shared/utils/env";

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
  const headers: Record<string, string> = {
    host: inboxUrl.host,
    date: new Date().toUTCString(),
    digest: `SHA-256=${createDigest(body)}`,
  };
  if (method === "GET") {
    headers.accept = "application/activity+json";
  }
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
      `keyId="https://${env.UNSOCIAL_DOMAIN}/users/${signer.id}/activity#main-key",` +
      `algorithm="rsa-sha256",` +
      `headers="${order.join(" ")}",` +
      `signature="${signature}"`,
  };
};
