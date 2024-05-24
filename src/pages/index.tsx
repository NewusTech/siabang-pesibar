import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Authentication",
  description: "Authentication forms built using the components.",
};

export default function Page() {
  return (
    <main
      style={{
        backgroundImage: `url('bg1.jpg')`,
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundSize: "cover",
      }}
      className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2563eb] to-[#15162c]"
    >
      <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16 ">
        <h1 className="px-3 text-center text-xl font-extrabold text-white md:text-3xl">
          SISTEM INFORMASI ADMINISTRASI DAN PEMBANGUNAN
        </h1>
        <img
          className="m-auto h-[200px] items-center"
          alt="logo"
          src="/logo.png"
        />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-8">
          <Link
            className="flex max-w-xs flex-col gap-4 rounded-xl bg-[#2563eb]/90 p-4 text-white hover:bg-[#2563eb]"
            href="login"
          >
            <h3 className="text-2xl font-bold">Anggaran →</h3>
            <div className="text-lg">Penganggaran, perencanaan, realisi</div>
          </Link>
          <Link
            className="flex max-w-xs flex-col gap-4 rounded-xl bg-[#2563eb]/90 p-4 text-white hover:bg-[#2563eb]"
            href="login"
          >
            <h3 className="text-2xl font-bold">Pembangunan →</h3>
            <div className="text-lg">Reaalisasi, monitoring, dokumentasi</div>
          </Link>
        </div>
      </div>
    </main>
  );
}
