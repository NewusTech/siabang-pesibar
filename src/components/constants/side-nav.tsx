import { BookOpenCheck, LayoutDashboard, Wallet, Minus, Building, User } from "lucide-react";
import { type NavItem } from "~/types";

const dashboard = {
  title: "Dashboard",
  icon: LayoutDashboard,
  href: "/dashboard",
  color: "text-black",
}

const anggaran = {
  title: "Anggaran",
  icon: Wallet,
  href: "/anggaran",
  color: "text-black",
  isChidren: true,
  children: [
    {
      title: "DPA",
      icon: Minus,
      color: "text-black",
      href: "/anggaran/dpa",
    },
    {
      title: "Rencana Pengambilan",
      icon: Minus,
      color: "text-black",
      href: "/anggaran/rencana",
    },
    {
      title: "Laporan",
      icon: Minus,
      color: "text-black",
      href: "/anggaran/laporan",
    },
  ],
}

const pembangunan = {
  title: "Pembangunan",
  icon: Building,
  href: "/pembangunan",
  color: "text-black",
  isChidren: true,
  children: [
    {
      title: "DPA",
      icon: Minus,
      color: "text-black",
      href: "/pembangunan/dpa",
    },
    {
      title: "Monitoring",
      icon: Minus,
      color: "text-black",
      href: "/pembangunan/monitoring",
    },
    {
      title: "Laporan",
      icon: Minus,
      color: "text-black",
      href: "/pembangunan/laporan",
    },
  ],
}

const user = {
  title: "Kelola User",
  icon: User,
  color: "text-black",
  href: "/users"
}

const master = {
  title: "Master",
  icon: BookOpenCheck,
  color: "text-black",
  href: "/master",
  isChidren: true,
  children: [
    {
      title: "OPD",
      icon: Minus,
      color: "text-black",
      href: "/master/dinas",
    },
    {
      title: "Satuan",
      icon: Minus,
      color: "text-black",
      href: "/master/satuan",
    },
    {
      title: "Sumber Dana",
      icon: Minus,
      color: "text-black",
      href: "/master/sumber-dana",
    },
    {
      title: "Perencanaan",
      icon: Minus,
      color: "text-black",
      href: "/master/perencanaan",
    },
    {
      title: "Organisasi",
      icon: Minus,
      color: "text-black",
      href: "/master/organisasi",
    },
    {
      title: "Akun",
      icon: Minus,
      color: "text-black",
      href: "/master/akun",
    }
  ]
}

export const SuperAdminNav: NavItem[] = [
  dashboard,
  anggaran,
  pembangunan,
  user,
  master
];

export const AnggaranNav: NavItem[] = [
  dashboard,
  anggaran
];

export const PembangunanNav: NavItem[] = [
  dashboard,
  pembangunan
]
