import { GET } from "./route";

describe("/.well-known/nodeinfo", () => {
  test("GET", async () => {
    const response = await GET();
    expect(response.status).toBe(200);
    expect(response.headers.get("Content-Type")).toBe("application/jrd+json");
    expect(await response.json()).toMatchInlineSnapshot(`
      {
        "links": [
          {
            "href": "https://myhost.example.com/.well-known/nodeinfo/2.1",
            "rel": "http://nodeinfo.diaspora.software/ns/schema/2.1",
          },
        ],
      }
    `);
  });
});
