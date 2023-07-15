#!/usr/bin/env -S pnpm tsx
import fs from "fs";

type MutationJson = {
  files: {
    [key: string]: {
      mutants: {
        static: boolean;
      }[];
    };
  };
};

const INCREMENTAL_JSON_PATH = "reports/mutation/stryker-incremental.json";

const readJson = () => {
  try {
    return JSON.parse(
      fs.readFileSync(INCREMENTAL_JSON_PATH, "utf-8"),
    ) as MutationJson;
  } catch (e) {
    console.error(`${e}`);
    process.exit(1);
  }
};

const writeJson = (json: MutationJson) => {
  try {
    fs.writeFileSync(INCREMENTAL_JSON_PATH, JSON.stringify(json, null, 2));
  } catch (e) {
    console.error(`${e}`);
    process.exit(1);
  }
};

const calcMutants = (json: MutationJson) => {
  const mutants = Object.values(json.files).flatMap((file) => file.mutants);
  return mutants.length;
};

const main = () => {
  const original = readJson();
  const withoutStaticMutants = Object.entries(original.files).map(
    ([filename, result]) =>
      [
        filename,
        {
          ...result,
          mutants: result.mutants.filter((mutant) => !mutant.static),
        },
      ] as const,
  );
  const modified = {
    ...original,
    files: Object.fromEntries(withoutStaticMutants),
  };
  writeJson(modified);
  const diff = calcMutants(original) - calcMutants(modified);
  console.log(`${INCREMENTAL_JSON_PATH}から${diff}個のStatic Mutantを削除`);
};

main();
