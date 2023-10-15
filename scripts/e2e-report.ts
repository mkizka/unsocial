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
  const unsocial = `:performing_arts: [unsocial](${process.env.E2E_TEST_S3_BASEURL}/${commit.oid}/unsocial/index.html)`;
  const mastodon = `:elephant: [mastodon](${process.env.E2E_TEST_S3_BASEURL}/${commit.oid}/mastodon/index.html)`;
  const misskey = `:m: [misskey](${process.env.E2E_TEST_S3_BASEURL}/${commit.oid}/misskey/index.html)`;
  comment.push(
    `| ${commit.messageHeadline} (${commit.oid}) | ${unsocial} ${mastodon} ${misskey} |`,
  );
}

console.log(comment.join("\n"));
