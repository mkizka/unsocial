import { execSync } from "child_process";

const $ = (cmd: string) => execSync(cmd, { stdio: "inherit" });

const globalSetup = () => {
  $("docker compose -f jest/compose.yaml up -d --wait");
  $("pnpm prisma db push --skip-generate");
};

export default globalSetup;
