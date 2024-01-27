import { execSync } from "child_process";

const globalTeardown = () => {
  execSync("docker compose -f jest/compose.yaml down");
};

export default globalTeardown;
