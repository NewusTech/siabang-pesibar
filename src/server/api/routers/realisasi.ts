import { TRPCError } from "@trpc/server";
import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
} from "~/server/api/trpc";

export const realisasiRouter = createTRPCRouter({
  getListSubkegiatan: protectedProcedure
    .input(z.object({ kegiatanId: z.string(), tahun: z.number(), dinas: z.string() }))
    .query(async ({ ctx, input }) => {

      const { dinas, kegiatanId, tahun } = input

      const sub = await ctx.db.subKegiatan.findMany({
        where: { kegiatanId },
      })

      const kegiatan = await ctx.db.kegiatan.findFirst({ where: { id: kegiatanId }, include: { program: true } })

      const subIds = sub.map((v) => v.id)

      const realisasi = await ctx.db.anggaranRealisasi.findMany({
        where: {
          subKegiatanId: { in: subIds },
          ...(dinas !== 'all' && { dinasId: dinas }),
        },
        include: {
          SubKegiatan: true,
          Dinas: true
        }
      })

      return {
        program: {
          kode: kegiatan?.program.kode,
          nama: kegiatan?.program.name
        },
        kegiatan: {
          kode: kegiatan?.kode,
          name: kegiatan?.name
        },
        list: realisasi.map((v, i) => ({
          ...v,
          no: i + 1,
          tahun: v.tahun.toString(),
          status: v.status.toString()
        }))

      }
    }),
  getRealisasi: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const { id } = input
      const result = await ctx.db.anggaranRealisasi.findFirst({
        where: { id },
        include: {
          AnggaranRealisasiPengambilan: true,
          SubKegiatan: { include: { kegiatan: { include: { program: true } } } }
        }
      })

      return {
        ...result,
        program: {
          kode: result?.SubKegiatan.kegiatan.program.kode,
          name: result?.SubKegiatan.kegiatan.program.name,
        },
        kegiatan: {
          kode: result?.SubKegiatan.kegiatan.kode,
          name: result?.SubKegiatan.kegiatan.name,
        },
        subKegiatan: {
          kode: result?.SubKegiatan.kode,
          name: result?.SubKegiatan.name,
        },
        form: result?.AnggaranRealisasiPengambilan.map((v) => {
          const date = new Date(0, v.bulan - 1); // Months are 0-indexed in JavaScript dates
          return { ...v, monthName: date.toLocaleString('en-US', { month: 'short' }) };
        }),
      }
    })
  ,
  getByProgramId: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const { id } = input
      const result = await ctx.db.kegiatan.findMany({
        where: { programId: id },
        orderBy: [{ createdAt: 'desc' }]
      })

      return result.map((v, i) => ({
        id: v.id,
        no: i + 1,
        kode: v.kode,
        name: v.name,
      }))
    }),
  setRealisasi: protectedProcedure
    .input(z.object({
      id: z.string(),
      operasi: z.number(),
      modal: z.number(),
      takTerduga: z.number(),
      transfer: z.number(),
      keterangan: z.string(),
      prevTerrealisasi: z.number()
    }))
    .mutation(async ({ ctx, input }) => {
      const { id, keterangan, modal, operasi, takTerduga, transfer, prevTerrealisasi } = input
      try {
        await ctx.db.$transaction(async (v) => {
          const res = await v.anggaranRealisasiPengambilan.findFirst({ where: { id } })
          if (res) {
            const rea = await v.anggaranRealisasi.findFirst({ where: { id: res.realisasiId } })
            if (rea) {
              const {
                operasi: prevOperasi,
                modal: prevModal,
                takTerduga: prevTakTerduga,
                transfer: prevTransfer,
              } = res

              const peng = await v.anggaranRealisasiPengambilan.update({
                where: { id },
                data: {
                  operasi,
                  modal,
                  takTerduga,
                  transfer,
                  keterangan
                }
              })


              const operasiValue = operasi - prevOperasi
              const modalValue = modal - prevModal
              const takTerdugaValue = takTerduga - prevTakTerduga
              const transferValue = transfer - prevTransfer

              const prevRealisasi = rea.orealiasi! + rea.mrealisasi! + rea.ttrealisasi! + rea.trealisasi!
              const newRealisasi = operasiValue + modalValue + takTerduga + transferValue

              console.log("prevRealisasi", prevRealisasi)
              console.log("newRealisasi", newRealisasi)

              await v.anggaranRealisasi.update({
                where: { id: peng.realisasiId },
                data: {
                  terrealisasi: prevRealisasi + newRealisasi,
                  orealiasi: { increment: operasiValue },
                  osisa: { decrement: operasiValue },
                  mrealisasi: { increment: modalValue },
                  msisa: { decrement: modalValue },
                  ttrealisasi: { increment: takTerdugaValue },
                  ttsisa: { decrement: takTerdugaValue },
                  trealisasi: { increment: transferValue },
                  tsisa: { decrement: transferValue }
                }
              })
            }



          }
        })
        return {
          ok: true
        }
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "An unexpected error occurred, please try again later.",
          cause: error,
        });
      }
    })
  ,
  add: protectedProcedure
    .input(z.object({ name: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // const { name } = input
      // try {
      //   await ctx.db.program.create({ data: { name } })
      //   return {
      //     ok: true,
      //     message: "Berhasil menambah program"
      //   }
      // } catch (error) {
      //   throw new TRPCError({
      //     code: "INTERNAL_SERVER_ERROR",
      //     message: "An unexpected error occurred, please try again later.",
      //     cause: error,
      //   });
      // }

    })
  ,
  update: protectedProcedure
    .input(z.object({ id: z.string(), name: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { name, id } = input
      try {
        await ctx.db.program.update({ data: { name }, where: { id } })

        return {
          ok: true,
          message: "Berhasil mengubah program"
        }
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "An unexpected error occurred, please try again later.",
          cause: error,
        });
      }
    }),
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { id } = input
      try {
        await ctx.db.program.delete({ where: { id } })
        return {
          ok: true,
          message: "Berhasil menghapus program"
        }
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "An unexpected error occurred, please try again later.",
          cause: error,
        });
      }
    }),
});
