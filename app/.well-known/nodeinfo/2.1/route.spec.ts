import { LocalNoteFactory, RemoteNoteFactory } from "@/_shared/factories/note";
import { GET } from "./route";

jest.mock("@/../package.json", () => ({
  version: "1.2.3",
}));

describe("/.well-known/nodeinfo", () => {
  test("管理者の投稿数をlocalPostsに設定したサーバー情報を返す", async () => {
    // arrange
    await LocalNoteFactory.createList(3);
    await RemoteNoteFactory.createList(1);
    // act
    const response = await GET();
    // assert
    expect(response.status).toBe(200);
    expect(response.headers.get("Content-Type")).toBe("application/jrd+json");
    expect(await response.json()).toMatchObject({
      usage: {
        localPosts: 3,
      },
    });
  });
});
