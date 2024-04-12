#!/usr/bin/env -S pnpm tsx
import { execSync } from "child_process";

const stdout = execSync(`gh pr view ${process.env.PR_NUMBER} --json commits`);

const { commits } = JSON.parse(stdout.toString()) as {
  commits: {
    messageHeadline: string;
    oid: string;
  }[];
};

const emojis = {
  unsocial: ":performing_arts:",
  mastodon: ":elephant:",
  misskey: ":m:",
  all: ":globe_with_meridians:",
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

const row = (commit: (typeof commits)[0]) => {
  return [
    "",
    `${commit.messageHeadline} (${commit.oid})`,
    column(
      ["unsocial", "mastodon", "misskey", "all"],
      commit.oid,
      "index.html",
    ),
    column(["mastodon", "misskey"], commit.oid, "docker.txt"),
    "",
  ]
    .join(" | ")
    .trim();
};

const showCount = 5;

const header = ["| commit | 結果 | ログ |", "| --- | --- | --- |"];

const showCommits = [
  ...header,
  ...commits.slice(commits.length - showCount).map(row),
];

const hiddenCommits = [
  ...header,
  ...commits.slice(0, commits.length - showCount).map(row),
];

console.log(`\
<details>
<summary>過去の結果</summary>

${hiddenCommits.join("\n")}
</details>

${showCommits.join("\n")}
`);
