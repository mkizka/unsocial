// このファイルは https://github.com/transmute-industries/RsaSignature2017 を元に作成しました
// Copyright (c) 2018 Transmute Industries Inc.

import crypto from "crypto";
import jsonld from "jsonld";
import type { RemoteDocument } from "jsonld/jsonld-spec";

import { userFindService } from "@/_shared/user/services/userFindService";
import { createLogger } from "@/_shared/utils/logger";

import { CONTEXTS } from "./contexts";

// https://github.com/digitalbazaar/jsonld.js/blob/5367858d28b6200aaf832d93eb666d4b819d5d4f/README.md#custom-document-loader
// @ts-expect-error
const nodeDocumentLoader = jsonld.documentLoaders.node();

const logger = createLogger("linkedDataSignatureService");

const customLoader = async (url: string): Promise<RemoteDocument> => {
  if (url in CONTEXTS) {
    return {
      document: CONTEXTS[url]!,
      documentUrl: url,
    };
  }
  logger.warn(`@contextに想定していないURLが指定されました: ${url}`);
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

type Signature = {
  type: string; // "RsaSignature2017";
  creator: string;
  created: string;
  nonce?: string;
  domain?: string;
  signatureValue: string;
};

type SignOptions = Omit<Signature, "signatureValue">;

const createVerifyData = async (
  data: object,
  options: Signature | SignOptions,
) => {
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
  const options: SignOptions = {
    type: "RsaSignature2017",
    creator,
    domain,
    nonce: crypto.randomBytes(16).toString("hex"),
    created: created || new Date().toISOString(),
  };
  if (domain) {
    options.domain = domain;
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

const findOrFetchUserByKeyId = async (keyId: string) => {
  const actorUrl = new URL(keyId);
  actorUrl.hash = "";
  const user = await userFindService.findOrFetchUserByActor(
    actorUrl.toString(),
  );
  if (user instanceof Error) {
    return null;
  }
  return user;
};

export const verify = async (data: { signature?: Signature }) => {
  if (!data.signature) {
    return {
      isValid: false,
      reason: "署名がありません",
    };
  }
  const toBeSigned = await createVerifyData(data, data.signature);
  const verifier = crypto.createVerify("sha256");
  verifier.update(toBeSigned);
  const creatorUser = await findOrFetchUserByKeyId(data.signature.creator);
  if (!creatorUser?.publicKey) {
    return {
      isValid: false,
      reason: "公開鍵が見つかりませんでした",
    };
  }
  const isValid = verifier.verify(
    creatorUser.publicKey,
    data.signature.signatureValue,
    "base64",
  );
  if (!isValid) {
    return {
      isValid: false,
      reason: "検証の結果不正と判断されました",
    };
  }
  return { isValid };
};
