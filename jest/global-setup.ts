import { execSync } from "child_process";

const globalSetup = () => {
  if ("STRYKER_MUTATOR_WORKER" in process.env) return;
  execSync("./scripts/setup-for-test.sh");
};

export default globalSetup;
