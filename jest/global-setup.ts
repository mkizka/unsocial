import { execSync } from "child_process";

const globalSetup = () => {
  if (process.env.STRYKER) return;
  execSync("./scripts/setup-for-test.sh");
};

export default globalSetup;
