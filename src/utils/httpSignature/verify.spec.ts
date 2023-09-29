import type { User } from "@prisma/client";

import { mockedPrisma } from "@/mocks/prisma";

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
import { mockedKeys } from "./__fixtures__/keys";
import { verifyActivity } from "./verify";

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
    ${expectedHeader}             | ${mockedKeys.publickKey} | ${dummyActivity}     | ${true}  | ${undefined}                                          | ${"署名されたActivityを検証する"}
    ${otherSignedHeader}          | ${mockedKeys.publickKey} | ${otherUserActivity} | ${false} | ${"keyIdに基づくユーザーとactorが一致しませんでした"} | ${"actorとkeyIdの持ち主(署名者が異なる場合、検証結果は不正"}
    ${expectedHeader}             | ${mockedKeys.publickKey} | ${invalidActivity}   | ${false} | ${"ActivityがDigestと一致しませんでした"}             | ${"ActivityがDigestと異なる場合、検証結果は不正"}
    ${noKeyIdHeader}              | ${mockedKeys.publickKey} | ${dummyActivity}     | ${false} | ${"Required"}                                         | ${"検証に必要なkeyIdがない場合、検証結果は不正"}
    ${noAlgorithmHeader}          | ${mockedKeys.publickKey} | ${dummyActivity}     | ${false} | ${'Invalid literal value, expected "rsa-sha256"'}     | ${"検証に必要なアルゴリズム名がない場合、検証結果は不正"}
    ${noHeadersHeader}            | ${mockedKeys.publickKey} | ${dummyActivity}     | ${false} | ${"Required"}                                         | ${"検証に必要なヘッダー順指定がない場合、検証結果は不正"}
    ${noSignatureHeader}          | ${mockedKeys.publickKey} | ${dummyActivity}     | ${false} | ${"Required"}                                         | ${"検証に必要なシグネチャーがない場合、検証結果は不正"}
    ${expectedHeader}             | ${null}                  | ${dummyActivity}     | ${false} | ${"keyIdから公開鍵が取得できませんでした"}            | ${"公開鍵がない場合、検証結果は不正"}
    ${invalidDateHeader}          | ${mockedKeys.publickKey} | ${dummyActivity}     | ${false} | ${"検証の結果不正と判断されました"}                   | ${"Dateが異なればsignatureも異なる"}
    ${invalidHostHeader}          | ${mockedKeys.publickKey} | ${dummyActivity}     | ${false} | ${"検証の結果不正と判断されました"}                   | ${"Hostが異なればsignatureも異なる"}
    ${invalidSignatureHeader}     | ${mockedKeys.publickKey} | ${dummyActivity}     | ${false} | ${"検証の結果不正と判断されました"}                   | ${"Signatureが異なればsignatureも異なる"}
    ${unSupportedAlgorithmHeader} | ${mockedKeys.publickKey} | ${dummyActivity}     | ${false} | ${'Invalid literal value, expected "rsa-sha256"'}     | ${"アルゴリズムはrsa-sha256以外は未サポート"}
    ${unSupportedDigestHeader}    | ${mockedKeys.publickKey} | ${dummyActivity}     | ${false} | ${"digestのアルゴリズムがSHA-256ではありません"}      | ${"DigestがSHA-256=で始まらない場合、検証結果は不正"}
  `(
    "$description",
    async ({ header, publicKey, activity, isValid, reason }) => {
      // arrange
      mockedPrisma.user.findUnique.mockResolvedValue({
        host: "myhost.example.com", // webfingerに通信しないようにテストでは全てローカルユーザーとして扱う
        actorUrl: "https://myhost.example.com/users/dummy_userId/activity",
        publicKey,
      } as User);
      // act
      const actual = await verifyActivity({
        pathname: "/inbox",
        headers: new Headers(header),
        activityRaw: JSON.stringify(activity),
      });
      // assert
      expect(actual).toEqual({ isValid, reason });
    },
  );
});
