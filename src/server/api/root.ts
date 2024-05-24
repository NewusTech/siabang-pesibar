import { createTRPCRouter } from "~/server/api/trpc";
import { dinasRouter } from "./routers/dinas";
import { satuanRouter } from "./routers/satuan";
import { sumberDanaRouter } from "./routers/sumberDana";
import { anggaranRouter } from "./routers/anggaran";
import { pembangunanRouter } from "./routers/pembanguan";
import { programRouter } from "./routers/program";
import { kegiatanRouter } from "./routers/kegiatan";
import { realisasiRouter } from "./routers/realisasi";
import { monitoringRouter } from "./routers/monitoring";
import { subKegiatanRouter } from "./routers/subKegiatan";
import { urusanRouter } from "./routers/urusan";
import { bidangRouter } from "./routers/bidang";
import { organisasiRouter } from "./routers/organisasi";
import { userRouter } from "./routers/user";
import { unitRouter } from "./routers/unit";
import { dashboardRouter } from "./routers/dashboard";
import { kelompokDanaRouter } from "./routers/kelompokDana";
import { jenisDanaRouter } from "./routers/jenisDana";
import { objekDanaRouter } from "./routers/objekDana";
import { sumberAkunRouter } from "./routers/sumberAkun";
import { kelompokAkunRouter } from "./routers/kelompokAkun";
import { jenisAkunRouter } from "./routers/jenisAkun";
import { objekAkunRouter } from "./routers/objekAkun";
import { subrincianObjekDanaRouter } from "./routers/subrincianDana";
import { rincianObjekDanaRouter } from "./routers/rincianDana";
import { rincianObjekAkunRouter } from "./routers/rincianAkun";
import { subrincianObjekAkunRouter } from "./routers/subrincianAkun";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  dinas: dinasRouter,
  satuan: satuanRouter,
  sumberAkun: sumberAkunRouter,
  kelompokAkun: kelompokAkunRouter,
  jenisAkun: jenisAkunRouter,
  objekAkun: objekAkunRouter,
  rincianObjekAkun: rincianObjekAkunRouter,
  subRincianObjekAkun: subrincianObjekAkunRouter,
  sumberDana: sumberDanaRouter,
  kelompokDana: kelompokDanaRouter,
  jenisDana: jenisDanaRouter,
  objekDana: objekDanaRouter,
  rincianObjekDana: rincianObjekDanaRouter,
  subRincianObjekDana: subrincianObjekDanaRouter,
  anggaran: anggaranRouter,
  pembangunan: pembangunanRouter,
  program: programRouter,
  kegiatan: kegiatanRouter,
  realisasi: realisasiRouter,
  monitoring: monitoringRouter,
  subKegiatan: subKegiatanRouter,
  urusan: urusanRouter,
  bidang: bidangRouter,
  organisasi: organisasiRouter,
  user: userRouter,
  unit: unitRouter,
  dashboard: dashboardRouter
});

// export type definition of API
export type AppRouter = typeof appRouter;
