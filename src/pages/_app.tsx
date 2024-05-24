import { type Session } from "next-auth";
import { SessionProvider } from "next-auth/react";
import { type AppType } from "next/app";

import { api } from "~/utils/api";

import "~/styles/globals.css";
import Head from "next/head";

const MyApp: AppType<{ session: Session | null }> = ({
  Component,
  pageProps: { session, ...pageProps },
}) => {
  return (
    <SessionProvider session={session}>
      <Head>
        <title>
          Sistem Informasi Administrasi dan Pembangunan - Kabupaten Pesisir
          Barat
        </title>
        <meta
          name="description"
          content="Sistem Informasi Administrasi dan Pembangunan Kabupaten Pesisir Barat menyediakan layanan informasi dan administrasi pembangunan yang efisien dan transparan untuk masyarakat dan pemerintah daerah."
        />
        <link rel="icon" href="/logo.png" />
      </Head>
      <Component {...pageProps} />
    </SessionProvider>
  );
};

export default api.withTRPC(MyApp);
