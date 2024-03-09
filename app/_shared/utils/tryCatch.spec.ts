import { tryCatch } from "./tryCatch";

const successFn = () => "success";

const errorFn = () => {
  throw new Error("error");
};

const asyncSuccessFn = async () => "success";

const asyncErrorFn = async () => {
  throw new Error("error");
};

const withArgsFn = (arg: string) => arg;

describe("tryCatch", () => {
  test.each`
    fn                | args         | result                | description
    ${successFn}      | ${undefined} | ${"success"}          | ${"同期処理を実行して結果を返す"}
    ${errorFn}        | ${undefined} | ${new Error("error")} | ${"同期処理でエラーが発生した場合はErrorオブジェクトを返す"}
    ${asyncSuccessFn} | ${undefined} | ${"success"}          | ${"非同期処理を実行して結果を返す"}
    ${asyncErrorFn}   | ${undefined} | ${new Error("error")} | ${"非同期処理でエラーが発生した場合はErrorオブジェクトを返す"}
    ${withArgsFn}     | ${"arg"}     | ${"arg"}              | ${"引数が必要な場合は引数を渡して実行する"}
  `("$description", async ({ fn, args, result }) => {
    const actual = await tryCatch(fn)(args);
    expect(actual).toEqual(result);
  });
});
