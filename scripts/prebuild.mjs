import { promises as fs } from "fs";
import path from "path";

// https://answers.netlify.com/t/server-edge-not-defined-error-on-nextjs-ssr-functions-cause-site-to-return-500-errors/91793/31
const prebuildScripts = async () => {
  const file = path.resolve("node_modules/next/dist/server/require-hook.js");
  const content = await fs.readFile(file, "utf-8");
  await fs.writeFile(
    file,
    content.replace(
      "if (process.env.__NEXT_PRIVATE_PREBUNDLED_REACT) {",
      "if (true) {"
    )
  );
};

prebuildScripts();
