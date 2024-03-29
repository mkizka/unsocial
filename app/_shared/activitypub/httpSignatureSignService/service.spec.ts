import { mockedKeys } from "@/_shared/mocks/keys";

import { httpSignatureSignService } from ".";

afterAll(() => {
  jest.useRealTimers();
});

describe("signActivity", () => {
  test.each`
    inboxUrl                                                 | date            | activity              | description
    ${new URL("https://remote.example.com/inbox")}           | ${"2023-01-01"} | ${{}}                 | ${"default"}
    ${new URL("https://remote1.example.com/inbox")}          | ${"2023-01-01"} | ${{}}                 | ${"url"}
    ${new URL("https://remote.example.com/users/foo/inbox")} | ${"2023-01-01"} | ${{}}                 | ${"path"}
    ${new URL("https://remote.example.com/inbox")}           | ${"2023-01-02"} | ${{}}                 | ${"date"}
    ${new URL("https://remote.example.com/inbox")}           | ${"2023-01-01"} | ${{ type: "Create" }} | ${"activity"}
  `(
    "署名されたヘッダーを返す: $description",
    ({ inboxUrl, date, activity }) => {
      // arrange
      jest.useFakeTimers().setSystemTime(new Date(date));
      // act
      const headers = httpSignatureSignService.signHeaders({
        signer: {
          id: "userId",
          privateKey: mockedKeys.privateKey,
        },
        body: JSON.stringify(activity),
        inboxUrl,
        method: "POST",
      });
      // assert
      expect(headers).toMatchSnapshot();
    },
  );
});
