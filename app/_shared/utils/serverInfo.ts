import { env } from "./env";

const serverName = env.UNSOCIAL_SITE_NAME ?? env.UNSOCIAL_HOST;

export const serverInfo = {
  name: serverName,
  title: `${serverName} on Unsocial`,
  description:
    env.UNSOCIAL_SITE_DESCRIPTION ??
    `${serverName}はUnsocialによって構築されたActivityPubサーバーです。`,
  themeColor: env.UNSOCIAL_THEME_COLOR ?? "#d3d9de",
};
