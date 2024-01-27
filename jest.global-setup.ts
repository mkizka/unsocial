import { execSync } from "child_process";

const globalSetup = () => {
  execSync("docker compose up db-test -d");
  execSync("pnpm prisma db push --skip-generate");
};

export default globalSetup;
