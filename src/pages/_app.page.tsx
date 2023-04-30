import { MantineProvider } from "@mantine/core";
import type { AppType } from "next/app";
import Head from "next/head";
import type { Session } from "next-auth";
import { SessionProvider } from "next-auth/react";

import { api } from "../utils/api";

const MyApp: AppType<{ session: Session | null }> = ({
  Component,
  pageProps: { session, ...pageProps },
}) => {
  return (
    <>
      <Head>
        <title>Page title</title>
        <meta
          name="viewport"
          content="minimum-scale=1, initial-scale=1, width=device-width"
        />
      </Head>

      <MantineProvider
        withGlobalStyles
        withNormalizeCSS
        theme={{
          /** Put your mantine theme override here */
          colorScheme: "light",
        }}
      >
        <SessionProvider session={session}>
          <Component {...pageProps} />
        </SessionProvider>
      </MantineProvider>
    </>
  );
};

export default api.withTRPC(MyApp);
