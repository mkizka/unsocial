// 参考:
// https://github.com/transmute-industries/RsaSignature2017
// https://github.com/misskey-dev/misskey/blob/30594dde181e9d151542c41c6f09e673fcbb3124/packages/backend/src/core/activitypub/LdSignatureService.ts
import crypto from "crypto";
import jsonld from "jsonld";
import type { RemoteDocument } from "jsonld/jsonld-spec";

import { CONTEXTS } from "./contexts";

// https://github.com/digitalbazaar/jsonld.js/blob/5367858d28b6200aaf832d93eb666d4b819d5d4f/README.md#custom-document-loader
// @ts-expect-error
const nodeDocumentLoader = jsonld.documentLoaders.node();

const customLoader = async (url: string): Promise<RemoteDocument> => {
  if (url in CONTEXTS) {
    return {
      document: CONTEXTS[url]!,
      documentUrl: url,
    };
  }
  return nodeDocumentLoader(url);
};

const canonize = async (data: jsonld.JsonLdDocument) => {
  return jsonld.canonize(data, {
    documentLoader: customLoader,
  });
};

const sha256 = (data: crypto.BinaryLike) => {
  const h = crypto.createHash("sha256");
  h.update(data);
  return h.digest("hex");
};

const createVerifyData = async (data: object, options: object) => {
  const transformedOptions: Record<string, unknown> = {
    ...options,
    "@context": "https://w3id.org/security/v1",
  };
  delete transformedOptions["type"];
  delete transformedOptions["id"];
  delete transformedOptions["signatureValue"];
  const canonizedOptions = await canonize(transformedOptions);
  const optionsHash = sha256(canonizedOptions);
  const transformedData: Record<string, unknown> = { ...data };
  delete transformedData["signature"];
  const cannonidedData = await canonize(transformedData);
  const documentHash = sha256(cannonidedData);
  const verifyData = `${optionsHash}${documentHash}`;
  return verifyData;
};

type Signature = {
  created: string;
  creator: string;
  signatureValue: string;
  type: string;
};

export const sign = async <T extends object>({
  data,
  creator,
  domain,
  created,
  privateKey,
}: {
  data: T;
  creator: string;
  domain?: string;
  created?: string;
  privateKey: string;
}): Promise<T & { signature: Signature }> => {
  const options = {
    type: "RsaSignature2017",
    creator,
    domain,
    nonce: crypto.randomBytes(16).toString("hex"),
    created: created || new Date().toISOString(),
  };
  if (!domain) {
    delete options.domain;
  }
  const toBeSigned = await createVerifyData(data, options);
  const signer = crypto.createSign("sha256");
  signer.update(toBeSigned);
  signer.end();
  const signature = signer.sign(privateKey);
  return {
    ...data,
    signature: {
      ...options,
      signatureValue: signature.toString("base64"),
    },
  };
};

export const verify = async ({
  data,
  publicKey,
}: {
  data: { signature: Signature };
  publicKey: string;
}) => {
  const toBeSigned = await createVerifyData(data, data.signature);
  const verifier = crypto.createVerify("sha256");
  verifier.update(toBeSigned);
  return verifier.verify(publicKey, data.signature.signatureValue, "base64");
};
