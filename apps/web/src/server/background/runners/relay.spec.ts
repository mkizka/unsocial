import { fetcher } from "@/utils/fetcher";
import { mockedKeys } from "@/utils/httpSignature/__fixtures__/keys";

import { relayActivity } from "./relay";

jest.useFakeTimers();
jest.setSystemTime(new Date("2020-01-01T00:00:00"));

jest.mock("@/utils/fetcher");
const mockedFetcher = jest.mocked(fetcher);

describe("relayActivity", () => {
  test("正常系", async () => {
    // arrange
    const dummySender = { id: "dummy", privateKey: mockedKeys.privateKey };
    // act
    await relayActivity({
      sender: dummySender,
      // @ts-ignore
      activity: { type: "Dummy" },
    });
    // arrange
    expect(mockedFetcher.mock.lastCall).toMatchInlineSnapshot(`
      [
        "https://misskey.localhost/inbox",
        {
          "body": "{"type":"Dummy"}",
          "headers": {
            "Accept": "application/activity+json",
            "date": "Tue, 31 Dec 2019 15:00:00 GMT",
            "digest": "SHA-256=GJpn7Z0rhlxi7/yIwjEeQln6ix6FqsnOBpzQ156l7mM=",
            "host": "misskey.localhost",
            "signature": "keyId="https://myhost.example.com/users/dummy#main-key",algorithm="rsa-sha256",headers="(request-target) host date digest",signature="aHxQGySL2CrZVZJcmDhyhtpsFcYrC9m5mhFiinC/3HRMz1X+627Sw2cwl+rPqb9ZFfjii3fzlthqJv98PQEfIODt+UPtafEFMEccHMbeCNL7peHs4EvBn2P4vna6mAYhGExljTpovrRZGLqdqyGN4ebJ6kpBGF5rXqpb5ndQ5meeVozIRRx5yZxCjpKYpekRzKBIjzARJMoth+FqBxxUXriQ2Znc7/mPHmzjPErxc+VqKU9ZQ1f1YTEKC17s45vgFKitcYrCvIumFk+9aHyp45CobzkaMsTJZuv+B9/tXdqHv3mXaq7lUAZnUX9CmqM7prps0PJQM3Z4KStBjQ=="",
          },
          "method": "POST",
        },
      ]
    `);
  });
});
