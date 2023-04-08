#!/usr/bin/env -S npx tsx
import fs from "fs";
import { $, fetch } from "zx";

$.verbose = false;

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
      ["Killed", "Timeout"].includes(mutant.status)
    ).length;
    const undetected = mutants.filter((mutant) =>
      ["Survived", "NoCoverage"].includes(mutant.status)
    ).length;
    score[filename] =
      Math.round((detected / (detected + undetected)) * 10000) / 100;
  }
  return score;
};

const table = async () => {
  const prScores = getScorePerFile(readJson("reports/mutation/mutation.json"));
  const mainScores = getScorePerFile(
    await fetchJson(
      "https://minio-s3.paas.mkizka.dev/soshal-mutation-test/main/mutation/mutation.json"
    )
  );
  const filenames = [
    ...new Set([...Object.keys(prScores), ...Object.keys(mainScores)]),
  ].sort();
  const comment = [
    "| ファイル名 | PR | main | 変化 |",
    "| --- | --- | --- | --- |",
  ];
  for (const filename of filenames) {
    const prText = `${prScores[filename] ?? "なし"}`;
    const mainText = `${mainScores[filename] ?? "なし"}`;
    if (prText == mainText) {
      continue;
    }
    const diffText =
      (prScores[filename] || 0) > (mainScores[filename] || 0)
        ? ":green_circle:"
        : ":warning:";
    comment.push(`| ${filename} | ${prText} | ${mainText} | ${diffText}`);
  }
  return comment.length > 2
    ? comment.join("\n")
    : "ミューテーションテスト結果に変化がありませんでした";
};

const branchName = (await $`git branch --show-current`).stdout.trim();
const baseUrl = process.env.MUTATION_TEST_S3_BASEURL + "/" + branchName;
const text = `${await table()}

:gun: [mutation.html](${baseUrl}/mutation/mutation.html)
:page_facing_up: [stryker.log](${baseUrl}/stryker.log)`;

console.log(text);
