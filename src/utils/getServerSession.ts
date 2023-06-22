// Stryker disable all
import { getServerSession as _getServerSession } from "next-auth";
import { cache } from "react";

import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export const getServerSession = cache(async () => {
  // テスト実行時にエラーが出るため動的インポートする
  const { cookies, headers } = await import("next/headers");
  // Error: Invariant: Method expects to have requestAsyncStorage, none available への回避策
  // https://github.com/nextauthjs/next-auth/issues/7486#issuecomment-1543747325
  const req = {
    headers: Object.fromEntries(headers() as Headers),
    cookies: Object.fromEntries(
      cookies()
        .getAll()
        .map((c) => [c.name, c.value])
    ),
  };
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  const res = { getHeader() {}, setCookie() {}, setHeader() {} };

  // @ts-ignore
  return _getServerSession(req, res, authOptions);
});
