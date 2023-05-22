#!/usr/bin/env -S pnpm tsx
import { execSync } from "child_process";

const stdout = execSync(`gh pr view ${process.env.PR_NUMBER} --json commits`);

const { commits } = JSON.parse(stdout.toString()) as {
  commits: {
    messageHeadline: string;
    oid: string;
  }[];
};

const comment = ["| commit | 結果 |", "| --- | --- |"];

for (const commit of commits) {
  const link = `:performing_arts: [playwright-report](${process.env.E2E_TEST_S3_BASEURL}/index.html)`;
  comment.push(`| ${commit.messageHeadline} (${commit.oid}) | ${link}`);
}

console.log(comment.join("\n"));
