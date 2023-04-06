import { prismaMock } from "../__mocks__/db";
import { findUserByActorId } from "./findUserByActorId";

describe("findUserByActorId", () => {
  describe("正常系", () => {
    test.each`
      actorUrl                                      | userId
      ${"https://myhost.example.com/users/foo"}     | ${"foo"}
      ${"https://myhost.example.com/users/foo/bar"} | ${"foo"}
    `(
      "$actorUrl に対して id: $userId のユーザーを返す",
      async ({ actorUrl, userId }) => {
        // act
        await findUserByActorId(new URL(actorUrl));
        // assert
        expect(prismaMock.user.findFirst).toBeCalledWith({
          where: { id: userId },
        });
      }
    );
  });
  describe("異常系", () => {
    test.each`
      actorUrl
      ${"https://myhost.example.com/user/foo"}
      ${"https://myhost.example.com/foo/users/bar"}
    `("$actorUrl に対して null を返す", async ({ actorUrl, userId }) => {
      // act
      const user = await findUserByActorId(new URL(actorUrl));
      // assert
      expect(user).toBeNull();
      expect(prismaMock.user.findFirst).not.toHaveBeenCalled();
    });
  });
});
