import { execSync } from "child_process";

const globalSetup = () => {
  process.env.UNSOCIAL_DATABASE_URL = `postgresql://postgres:password@localhost:5432/unsocial-jest`;
  execSync("pnpm prisma db push --skip-generate", { env: process.env });
};

export default globalSetup;
