import React from "react";
import Header from "~/components/layout/header";
import Sidebar from "~/components/layout/sidebar";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export const Layout = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter()
  const { data: sessionData, status } = useSession();

  if (status === 'loading') {
    return (
      <div>
        loading
      </div>
    )
  }
  if (status === 'unauthenticated') {
    router.replace('/')
  }
  if (status === 'authenticated' && sessionData) {

    return (
      <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
        <Sidebar data={sessionData} />
        <div className="flex flex-col">
          <Header data={sessionData} />
          <main className="flex flex-1 flex-col">
            {children}
          </main>
        </div>
      </div>
    );
  }
};