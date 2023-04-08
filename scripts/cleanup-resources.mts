#!/usr/bin/env -S npx tsx
import fs from "fs/promises";
import os from "os";
import path from "path";
import { $ } from "zx";

const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "zx-"));
const tmpFile = path.join(tmpDir, "result.json");

const { stdout: prNumbers } =
  await $`gh pr list --json number | jq '.[].number'`;

const getAppNames = async () => {
  await $`npx caprover api -m GET -d "" -t /user/apps/appDefinitions -u ${process.env.CAPROVER_URL} -p ${process.env.CAPROVER_PASSWORD} -o ${tmpFile}`;
  const { stdout: appNames } =
    await $`jq -r '.appDefinitions | map(.appName) | .[]' < ${tmpFile}`;

  const appNamesToUse = prNumbers.split("\n").map((n) => `pr${n}-soshal`);
  return appNames
    .split("\n")
    .filter((app) => /pr\d+-soshal/.test(app) && !appNamesToUse.includes(app));
};

for (const appName of await getAppNames()) {
  const data = JSON.stringify({ appName, volumes: [] });
  await $`npx caprover api -m POST -d ${data} -t /user/apps/appDefinitions/delete -u ${process.env.CAPROVER_URL} -p ${process.env.CAPROVER_PASSWORD}`;
}
