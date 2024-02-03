#!/usr/bin/env -S pnpm tsx
import child_process from "child_process";
import fs from "fs";
type Result = {
  files: {
    [key: string]: {
      mutants: {
        status: "NoCoverage";
      }[];
    };
  };
};

type Score = {
  [key: string]: number;
};

const readJson = (resultPath: string) => {
  try {
    return JSON.parse(fs.readFileSync(resultPath, "utf-8")) as Result;
  } catch (e) {
    console.error(`${e}`);
    process.exit(1);
  }
};

const fetchJson = async (url: string) => {
  try {
    const response = await fetch(url);
    return response.json() as Promise<Result>;
  } catch (e) {
    console.error(`${e}`);
    process.exit(1);
  }
};

// https://stryker-mutator.io/docs/mutation-testing-elements/mutant-states-and-metrics/#metrics
const getScorePerFile = (result: Result) => {
  const score: Score = {};
  for (const [filename, { mutants }] of Object.entries(result.files)) {
    const detected = mutants.filter((mutant) =>
      ["Killed", "Timeout"].includes(mutant.status),
    ).length;
    const undetected = mutants.filter((mutant) =>
      ["Survived", "NoCoverage"].includes(mutant.status),
    ).length;
    score[filename] =
      Math.round((detected / (detected + undetected)) * 10000) / 100;
  }
  return score;
};

const evaluate = (score: number | undefined) => {
  if (score === undefined || isNaN(score)) {
    return 0;
  }
  return score;
};

const isSuccess = (
  prScore: number | undefined,
  mainScore: number | undefined,
) => {
  return (
    evaluate(prScore) >= evaluate(mainScore) ||
    // PRのスコアがNaNの場合は合格扱い
    Number.isNaN(prScore)
  );
};

const table = async (baseUrl: string, branchName: string) => {
  const prScores = getScorePerFile(readJson("reports/mutation/mutation.json"));
  const mainScores = getScorePerFile(
    await fetchJson(`${baseUrl}/main/mutation.json`),
  );
  const filenames = [
    ...new Set([...Object.keys(prScores), ...Object.keys(mainScores)]),
  ].sort();
  const comment = [
    "| ファイル名 | スコア | :white_check_mark: |",
    "| --- | --- | --- |",
  ];
  for (const filename of filenames) {
    const rawPrScore = prScores[filename]; // number | NaN | undefined
    const rawMainScore = mainScores[filename]; // number | NaN | undefined
    if (
      // NaNとNaNは等しくないので文字列化して比較
      String(rawPrScore) === String(rawMainScore) ||
      // PRのスコアにファイルが無い場合は削除または移動なので無視
      rawPrScore === undefined
    ) {
      continue;
    }
    const diffText = isSuccess(rawPrScore, rawMainScore)
      ? ":white_check_mark:"
      : ":x:";
    const hash = filename.replace("app/", "mutant/");
    const filenameText = `[${filename}](${baseUrl}/${branchName}/mutation.html#${hash})`;
    comment.push(
      `| ${filenameText} | ${rawMainScore} → ${rawPrScore} | ${diffText} |`,
    );
  }
  return comment.length > 2
    ? comment.join("\n")
    : "ミューテーションテスト結果に変化がありませんでした";
};

const main = async () => {
  const baseUrl =
    process.env.MUTATION_TEST_S3_BASEURL ??
    "https://gha.unsocial.dev/mutation-test";
  const branchName =
    process.env.BRANCH_NAME ??
    child_process.execSync("git branch --show-current").toString().trim();

  const text = `${await table(baseUrl, branchName)}
  
  :gun: [mutation.html (${branchName})](${baseUrl}/pr/${branchName}/mutation.html)
  :gun: [mutation.html (main)](${baseUrl}/main/mutation.html)
  :page_facing_up: [stryker.txt](${baseUrl}/${branchName}/stryker.txt)`;

  console.log(text);
};

main().catch(console.error);
