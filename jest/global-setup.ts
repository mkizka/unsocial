import { execSync } from "child_process";

const $ = (cmd: string) => execSync(cmd, { stdio: "inherit" });

const globalSetup = () => {
  $("docker compose -f jest/compose.yaml down -v");
  $("docker compose -f jest/compose.yaml up -d --wait");
  $("pnpm prisma migrate deploy");
};

export default globalSetup;
