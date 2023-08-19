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
  noSignatureHeader,
  unSupportedAlgorithmHeader,
} from "./__fixtures__/headers";
import { mockedKeys } from "./__fixtures__/keys";
import { verifyActivity } from "./verify";

describe("verifyActivity", () => {
  test.each`
    header                        | expectedIsValid | expectedReason                                    | description
    ${expectedHeader}             | ${true}         | ${undefined}                                      | ${"署名されたActivityを検証する"}
    ${noKeyIdHeader}              | ${false}        | ${"Required"}                                     | ${"検証に必要な公開鍵がない"}
    ${noAlgorithmHeader}          | ${false}        | ${'Invalid literal value, expected "rsa-sha256"'} | ${"検証に必要なアルゴリズム名がない"}
    ${noHeadersHeader}            | ${false}        | ${"Required"}                                     | ${"検証に必要なヘッダー順指定がない"}
    ${noSignatureHeader}          | ${false}        | ${"Required"}                                     | ${"検証に必要なシグネチャーがない"}
    ${invalidDateHeader}          | ${false}        | ${"検証の結果不正と判断されました"}               | ${"Dateが異なればsignatureも異なる"}
    ${invalidDigestHeader}        | ${false}        | ${"検証の結果不正と判断されました"}               | ${"Digestが異なればsignatureも異なる"}
    ${invalidHostHeader}          | ${false}        | ${"検証の結果不正と判断されました"}               | ${"Hostが異なればsignatureも異なる"}
    ${invalidSignatureHeader}     | ${false}        | ${"検証の結果不正と判断されました"}               | ${"Signatureが異なればsignatureも異なる"}
    ${unSupportedAlgorithmHeader} | ${false}        | ${'Invalid literal value, expected "rsa-sha256"'} | ${"アルゴリズムがrsa-sha256でない"}
  `("$description", async ({ header, expectedIsValid, expectedReason }) => {
    // arrange
    mockedPrisma.user.findFirst.mockResolvedValue({
      host: "myhost.example.com", // 他ホストだとwebfingerから取得してしまうため
      publicKey: mockedKeys.publickKey,
    } as User);
    // act
    const actual = await verifyActivity("/inbox", new Headers(header));
    // assert
    expect(actual).toEqual({
      isValid: expectedIsValid,
      reason: expectedReason,
    });
  });
});
