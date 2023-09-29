import type { User } from "@prisma/client";

import { mockedPrisma } from "@/mocks/prisma";

import {
  expectedHeader,
  invalidDateHeader,
  invalidDigestHeader,
  invalidHostHeader,
  invalidSignatureHeader,
  noAlgorithmHeader,
  noHeadersHeader,
  noKeyIdHeader,
  noSHA256Header,
  noSignatureHeader,
  unSupportedAlgorithmHeader,
} from "./__fixtures__/headers";
import { mockedKeys } from "./__fixtures__/keys";
import { verifyActivity } from "./verify";

describe("verifyActivity", () => {
  test.each`
    header                        | publicKey                | isValid  | reason                                            | description
    ${expectedHeader}             | ${mockedKeys.publickKey} | ${true}  | ${undefined}                                      | ${"署名されたActivityを検証する"}
    ${noKeyIdHeader}              | ${mockedKeys.publickKey} | ${false} | ${"Required"}                                     | ${"検証に必要なkeyIdがない場合、検証結果は不正"}
    ${noAlgorithmHeader}          | ${mockedKeys.publickKey} | ${false} | ${'Invalid literal value, expected "rsa-sha256"'} | ${"検証に必要なアルゴリズム名がない場合、検証結果は不正"}
    ${noHeadersHeader}            | ${mockedKeys.publickKey} | ${false} | ${"Required"}                                     | ${"検証に必要なヘッダー順指定がない場合、検証結果は不正"}
    ${noSignatureHeader}          | ${mockedKeys.publickKey} | ${false} | ${"Required"}                                     | ${"検証に必要なシグネチャーがない場合、検証結果は不正"}
    ${noSHA256Header}             | ${mockedKeys.publickKey} | ${false} | ${"digestのアルゴリズムがSHA-256ではありません"}  | ${"DigestがSHA-256=で始まらない場合、検証結果は不正"}
    ${expectedHeader}             | ${null}                  | ${false} | ${"keyIdから公開鍵が取得できませんでした"}        | ${"公開鍵がない場合、検証結果は不正"}
    ${invalidDateHeader}          | ${mockedKeys.publickKey} | ${false} | ${"検証の結果不正と判断されました"}               | ${"Dateが異なればsignatureも異なる"}
    ${invalidDigestHeader}        | ${mockedKeys.publickKey} | ${false} | ${"検証の結果不正と判断されました"}               | ${"Digestが異なればsignatureも異なる"}
    ${invalidHostHeader}          | ${mockedKeys.publickKey} | ${false} | ${"検証の結果不正と判断されました"}               | ${"Hostが異なればsignatureも異なる"}
    ${invalidSignatureHeader}     | ${mockedKeys.publickKey} | ${false} | ${"検証の結果不正と判断されました"}               | ${"Signatureが異なればsignatureも異なる"}
    ${unSupportedAlgorithmHeader} | ${mockedKeys.publickKey} | ${false} | ${'Invalid literal value, expected "rsa-sha256"'} | ${"アルゴリズムはrsa-sha256以外は未サポート"}
  `("$description", async ({ header, publicKey, isValid, reason }) => {
    // arrange
    mockedPrisma.user.findUnique.mockResolvedValue({
      host: "myhost.example.com", // webfingerに通信しないようにテストでは全てローカルユーザーとして扱う
      publicKey,
    } as User);
    // act
    const actual = await verifyActivity("/inbox", new Headers(header));
    // assert
    expect(actual).toEqual({ isValid, reason });
  });
});
