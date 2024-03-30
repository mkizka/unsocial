import mkizkaConfig from "@mkizka/eslint-config/flat";

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
  ...mkizkaConfig,
];
