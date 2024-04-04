// @ts-check
import { FlatCompat } from "@eslint/eslintrc";
import { mkizka } from "@mkizka/eslint-config";

const compat = new FlatCompat();

const config = [
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
  ...compat.extends(
    "next/core-web-vitals",
    "plugin:tailwindcss/recommended",
    "plugin:storybook/recommended",
  ),
  {
    rules: {
      // next
      "@next/next/no-img-element": "off",
      // tailwindcss
      "tailwindcss/classnames-order": "error",
      "tailwindcss/no-custom-classname": [
        "error",
        {
          callees: ["cn", "cva"],
        },
      ],
      "tailwindcss/migration-from-tailwind-2": "error",
    },
  },
  ...mkizka({
    alias: {
      "@": "./app",
    },
  }),
];

export default config;
