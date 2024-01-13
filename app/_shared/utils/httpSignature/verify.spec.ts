import type { User } from "@prisma/client";
import type { NextRequest } from "next/server";

import { mockedKeys } from "@/_mocks/keys";
import { mockedPrisma } from "@/_mocks/prisma";

import {
  expectedHeader,
  invalidDateHeader,
  invalidHostHeader,
  invalidSignatureHeader,
  noAlgorithmHeader,
  noHeadersHeader,
  noKeyIdHeader,
  noSignatureHeader,
  otherSignedHeader,
  unSupportedAlgorithmHeader,
  unSupportedDigestHeader,
} from "./__fixtures__/headers";
import { verifyRequest } from "./verify";

const dummyActivity = {
  type: "Dummy",
  actor: "https://myhost.example.com/users/dummy_userId/activity",
};

const invalidActivity = {
  type: "Invlaid",
  actor: "https://myhost.example.com/users/dummy_userId/activity",
};

const otherUserActivity = {
  type: "Dummy",
  actor: "https://myhost.example.com/users/dummy_other_userId/activity",
};

describe("verifyActivity", () => {
  test.each`
    header                        | publicKey                | activity             | isValid  | reason                                                | description
    ${expectedHeader}             | ${mockedKeys.publickKey} | ${dummyActivity}     | ${true}  | ${undefined}                                          | ${"ヘッダーが正しく署名されていた"}
    ${otherSignedHeader}          | ${mockedKeys.publickKey} | ${otherUserActivity} | ${false} | ${"keyIdに基づくユーザーとactorが一致しませんでした"} | ${"actorとkeyIdの持ち主が一致しない(他人が署名した)"}
    ${expectedHeader}             | ${mockedKeys.publickKey} | ${invalidActivity}   | ${false} | ${"ActivityがDigestと一致しませんでした"}             | ${"ActivityがDigestと異なる(Activityが改ざんされている)"}
    ${noKeyIdHeader}              | ${mockedKeys.publickKey} | ${dummyActivity}     | ${false} | ${"Required"}                                         | ${"検証必要なkeyIdがない"}
    ${noAlgorithmHeader}          | ${mockedKeys.publickKey} | ${dummyActivity}     | ${false} | ${'Invalid literal value, expected "rsa-sha256"'}     | ${"検証に必要なアルゴリズム名がない"}
    ${noHeadersHeader}            | ${mockedKeys.publickKey} | ${dummyActivity}     | ${false} | ${"Required"}                                         | ${"検証に必要なヘッダー順指定がない"}
    ${noSignatureHeader}          | ${mockedKeys.publickKey} | ${dummyActivity}     | ${false} | ${"Required"}                                         | ${"検証に必要なシグネチャーがない"}
    ${expectedHeader}             | ${null}                  | ${dummyActivity}     | ${false} | ${"keyIdから公開鍵が取得できませんでした"}            | ${"keyIdから公開鍵が取れない"}
    ${invalidDateHeader}          | ${mockedKeys.publickKey} | ${dummyActivity}     | ${false} | ${"検証の結果不正と判断されました"}                   | ${"Dateが改ざんされている"}
    ${invalidHostHeader}          | ${mockedKeys.publickKey} | ${dummyActivity}     | ${false} | ${"検証の結果不正と判断されました"}                   | ${"Hostが改ざんされている"}
    ${invalidSignatureHeader}     | ${mockedKeys.publickKey} | ${dummyActivity}     | ${false} | ${"検証の結果不正と判断されました"}                   | ${"Signatureが改ざんされている"}
    ${unSupportedAlgorithmHeader} | ${mockedKeys.publickKey} | ${dummyActivity}     | ${false} | ${'Invalid literal value, expected "rsa-sha256"'}     | ${"アルゴリズムはrsa-sha256でない"}
    ${unSupportedDigestHeader}    | ${mockedKeys.publickKey} | ${dummyActivity}     | ${false} | ${"digestのアルゴリズムがSHA-256ではありません"}      | ${"DigestがSHA-256でない"}
  `(
    "$descriptionとき、$isValidを返す",
    async ({ header, publicKey, activity, isValid, reason }) => {
      // arrange
      mockedPrisma.user.findUnique.mockResolvedValue({
        host: "myhost.example.com", // webfingerに通信しないようにテストでは全てローカルユーザーとして扱う
        actorUrl: "https://myhost.example.com/users/dummy_userId/activity",
        publicKey,
      } as User);
      const dummyRequest = {
        method: "POST",
        headers: new Headers(header),
        nextUrl: new URL("https://myhost.example.com/inbox"),
        json: async () => activity,
        text: async () => JSON.stringify(activity),
        clone: () => dummyRequest,
      } as unknown as NextRequest;
      // act
      const actual = await verifyRequest(dummyRequest);
      // assert
      expect(actual).toEqual({ isValid, reason });
    },
  );
});
