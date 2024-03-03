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
    const error = new ActivitySchemaValidationError(parsed.error);
    expect(error.message).toMatchSnapshot();
    expect(error.level).toBe("warn");
  });
  test(BadActivityRequestError.name, () => {
    const error = new BadActivityRequestError("エラーメッセージ");
    expect(error.message).toBe("エラーメッセージ");
    expect(error.level).toBe("warn");
  });
  test(UnexpectedActivityRequestError.name, () => {
    const error = new UnexpectedActivityRequestError("エラーメッセージ");
    expect(error.message).toBe("エラーメッセージ");
    expect(error.level).toBe("error");
  });
});
