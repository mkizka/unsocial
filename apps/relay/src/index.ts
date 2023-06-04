import arg from "arg";

import { relayActivity } from "./relay";
import { startServer } from "./server";

const args = arg(
  {
    "--dev": Boolean,
  },
  { permissive: true }
);

if (args["--dev"]) {
  startServer();
} else {
  relayActivity(args._[0]);
}
