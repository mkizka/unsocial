#!/usr/bin/env -S pnpm tsx
import { execSync } from "child_process";

const stdout = execSync(`gh pr view ${process.env.PR_NUMBER} --json commits`);

const { commits } = JSON.parse(stdout.toString()) as {
  commits: {
    messageHeadline: string;
    oid: string;
  }[];
};

const table = ["| commit | 結果 | ログ |", "| --- | --- | --- |"];

const emojis = {
  unsocial: ":performing_arts:",
  mastodon: ":elephant:",
  misskey: ":m:",
} as const;

const link = (
  service: keyof typeof emojis,
  commitId: string,
  filename: string,
) => {
  return `${emojis[service]} [${service}](${process.env.E2E_TEST_S3_BASEURL}/${commitId}/${service}/${filename})`;
};

const column = (
  services: (keyof typeof emojis)[],
  commitId: string,
  filename: string,
) => {
  return services
    .map((service) => link(service, commitId, filename))
    .join("<br>");
};

for (const commit of commits) {
  table.push(
    [
      "",
      `${commit.messageHeadline} (${commit.oid})`,
      column(["unsocial", "mastodon", "misskey"], commit.oid, "index.html"),
      column(["mastodon", "misskey"], commit.oid, "docker.txt"),
      "",
    ]
      .join(" | ")
      .trim(),
  );
}

console.log(table.join("\n"));
