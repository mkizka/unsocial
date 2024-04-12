#!/usr/bin/env -S pnpm tsx
import child_process from "child_process";
import fs from "fs";
import { z } from "zod";

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

const canEvaluate = (score: number | undefined): score is number => {
  return !(score === undefined || isNaN(score));
};

const evaluate = (score: number | undefined) => {
  return canEvaluate(score) ? score : 0;
};

const isSuccess = (prScore: number, mainScore: number | undefined) => {
  // mainブランチに点数が無いかつ、PRでミュータントが発生したにも関わらずテストが無い場合は不合格とする
  if (!canEvaluate(mainScore) && prScore === 0) {
    return false;
  }
  return (
    evaluate(prScore) >= evaluate(mainScore) ||
    // PRのスコアがNaNの場合は合格扱い
    Number.isNaN(prScore)
  );
};

const table = async (baseUrls: { main: string; pr: string }) => {
  const prScores = getScorePerFile(readJson("reports/mutation/mutation.json"));
  const mainScores = getScorePerFile(
    await fetchJson(`${baseUrls.main}/mutation.json`),
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
    const filenameText = `[${filename}](${baseUrls.pr}/mutation.html#${hash})`;
    comment.push(
      `| ${filenameText} | ${rawMainScore} → ${rawPrScore} | ${diffText} |`,
    );
  }
  return comment.length > 2
    ? comment.join("\n")
    : "ミューテーションテスト結果に変化がありませんでした";
};

const main = async () => {
  const env = z
    .object({
      AWS_S3_PUBLIC_URL: z.string().url().default("https://gha.unsocial.dev"),
      BRANCH_NAME: z
        .string()
        .default(
          child_process.execSync("git branch --show-current").toString().trim(),
        ),
    })
    .parse(process.env);
  const baseUrls = {
    main: `${env.AWS_S3_PUBLIC_URL}/mutation-test/main`,
    pr: `${env.AWS_S3_PUBLIC_URL}/mutation-test/pr/${env.BRANCH_NAME}`,
  };
  const text = `${await table(baseUrls)}
  
  :gun: [mutation.html (${env.BRANCH_NAME})](${baseUrls.pr}/mutation.html)
  :gun: [mutation.html (main)](${baseUrls.main}/mutation.html)
  :page_facing_up: [stryker.txt](${baseUrls.pr}/stryker.txt)`;

  console.log(text);
};

main().catch(console.error);
