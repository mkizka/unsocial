import { mkizka } from "@mkizka/eslint-config";

export default [
  {
    ignores: [
      // next
      ".next",
      // stryker
      "reports",
      ".stryker-tmp",
      // prisma-fabbrica
      "app/_generated",
    ],
  },
  ...mkizka({
    alias: {
      "@": "./app",
    },
  }),
];
