import arg from "arg";
import { startServer } from "./server";
import { relayActivity } from "./relay";

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
