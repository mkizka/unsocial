import { execSync } from "child_process";

const globalSetup = () => {
  execSync("pnpm prisma db push --skip-generate");
};

export default globalSetup;
