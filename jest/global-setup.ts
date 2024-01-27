import { execSync } from "child_process";

const globalSetup = () => {
  execSync("docker compose -f jest/compose.yaml up -d --wait");
  execSync("pnpm prisma db push --skip-generate");
};

export default globalSetup;
