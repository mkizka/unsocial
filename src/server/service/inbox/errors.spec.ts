import { z } from "zod";

import {
  ActivitySchemaValidationError,
  BadActivityRequestError,
  UnexpectedActivityRequestError,
} from "./errors";

describe("errors", () => {
  test(ActivitySchemaValidationError.name, () => {
    const parsed = z.object({ foo: z.string() }).safeParse({ foo: null });
    if (parsed.success) throw new Error();
    const error = new ActivitySchemaValidationError(parsed.error, {
      type: "Dummy",
    });
    expect(error.message).toMatchSnapshot();
    expect(error.level).toBe("warn");
    expect(error.statusCode).toBe(400);
  });
  test(BadActivityRequestError.name, () => {
    const error = new BadActivityRequestError("エラーメッセージ", {
      type: "Dummy",
    });
    expect(error.message).toMatchSnapshot();
    expect(error.level).toBe("warn");
    expect(error.statusCode).toBe(400);
  });
  test(UnexpectedActivityRequestError.name, () => {
    const error = new UnexpectedActivityRequestError("エラーメッセージ", {
      type: "Dummy",
    });
    expect(error.message).toMatchSnapshot();
    expect(error.level).toBe("error");
    expect(error.statusCode).toBe(500);
  });
});
