import { TRPCError } from "@trpc/server";
import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
} from "~/server/api/trpc";

export const dashboardRouter = createTRPCRouter({
  get: protectedProcedure
    .input(z.object({ dinasId: z.string().optional(), tahun: z.number() }))
    .query(async ({ ctx, input }) => {
      const { dinasId, tahun } = input

      const res = await ctx.db.anggaranDPA.findMany({
        where: { ...(dinasId !== 'all' && { dinasId: dinasId }), tahun },
        include: { Kegiatan: true }
      })

      const anggaran = res.map((v) => v.jumlahAlokasi)
      const realisasi = res.map((v) => v.teralokasi)
      const sisaAlokasi = res.map((v) => v.sisaAlokasi)

      const totalAnggaran = anggaran.reduce((accumulator, currentValue) => (accumulator || 0) + (currentValue || 0), 0);
      const totalRealisasi = realisasi.reduce((accumulator, currentValue) => (accumulator || 0) + (currentValue || 0), 0);
      const totalRealisasiPercent = (((totalRealisasi || 0) / (totalAnggaran || 0)) * 100).toFixed(2)
      const totalSisaAlokasi = sisaAlokasi.reduce((accumulator, currentValue) => (accumulator || 0) + (currentValue || 0), 0);

      const asdf = await ctx.db.anggaranRealisasi.findMany({
        where: {
          dinasId, tahun
        },
        include: { AnggaranRealisasiPengambilan: true }
      })

      let njim: any = []

      asdf.forEach(element => {
        element.AnggaranRealisasiPengambilan.forEach((v) => {
          njim.push(v)
        })
      });

      const merged = njim.reduce((accumulator: any, { bulan, operasi, modal, takTerduga, transfer }: any) => {
        if (!accumulator[bulan]) {
          accumulator[bulan] = { bulan, operasi, modal, takTerduga, transfer };
        } else {
          accumulator[bulan].operasi += operasi;
          accumulator[bulan].modal += modal;
          accumulator[bulan].takTerduga += takTerduga;
          accumulator[bulan].transfer += transfer;
        }
        return accumulator;
      }, {});

      const result = Object.values(merged);

      let sisa = totalAnggaran || 0;

      const charts: any = result.map((v: any) => {
        const realisasi = v.operasi + v.modal + v.takTerduga + v.transfer
        const month = new Date(0, v.bulan - 1).toLocaleString('en-US', { month: 'short' });
        sisa -= realisasi;
        return ({
          month,
          realisasi,
          sisa
        })
      })

      let topFive = res.sort((a, b) => (b.jumlahAlokasi || 0) - (a.jumlahAlokasi || 0)).slice(0, 5).map((v) => ({ value: v.jumlahAlokasi, name: v.Kegiatan?.name }));

      return {
        totalAnggaran,
        totalRealisasi,
        totalRealisasiPercent,
        totalSisaAlokasi,
        charts,
        topFive
      }
    }),

});
