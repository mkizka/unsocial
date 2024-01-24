"use client";

import * as Sentry from "@sentry/nextjs";
import Error from "next/error";
import { useEffect } from "react";

// https://nextjs.org/docs/app/building-your-application/routing/error-handling#handling-errors-in-root-layouts
export default function GlobalError({
  error,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html>
      <body>
        <Error statusCode={500} />
      </body>
    </html>
  );
}
