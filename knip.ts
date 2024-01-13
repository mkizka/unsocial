import type { KnipConfig } from "knip";

const config: KnipConfig = {
  rules: {
    files: "off",
    dependencies: "off",
  },
  ignore: [
    // 未使用の型もExportしているが利便性のためにそのままにする
    "app/_shared/activitypub/apSchemaService/service.ts",
  ],
};

export default config;
