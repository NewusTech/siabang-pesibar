import { TRPCError } from "@trpc/server";
import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
} from "~/server/api/trpc";

export const subKegiatanRouter = createTRPCRouter({
  get: protectedProcedure
    .query(async ({ ctx }) => {
      const result = await ctx.db.dinas.findMany({
        orderBy: [{ createdAt: 'desc' }]
      })
      return result.map((v) => ({
        ...v,
        action: 'Action'
      }))
    }),
    getbyid: protectedProcedure
    .input(z.object({ kegiatanId: z.string().optional() }))
    .query(async ({ ctx, input }) => {
      const { kegiatanId } = input

      const result = await ctx.db.subKegiatan.findMany({
        where: {
          kegiatanId
        },
        orderBy: [{ createdAt: 'desc' }]
      })
      return result.map((v) => ({
        ...v,
        action: 'Action'
      }))
    }),
  add: protectedProcedure
    .input(z.object({ name: z.string(), kode: z.string(), kegiatanId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { name, kode, kegiatanId } = input
      try {
        await ctx.db.subKegiatan.create({ data: { name, kode, kegiatanId } })
        return {
          ok: true,
          message: "Berhasil menambah sub kegiatan"
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
  update: protectedProcedure
    .input(z.object({ id: z.string(), name: z.string(), kode: z.string(), kegiatanId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { name, id, kode, kegiatanId } = input
      try {
        await ctx.db.subKegiatan.update({ data: { name, kode, kegiatanId }, where: { id } })

        return {
          ok: true,
          message: "Berhasil mengubah sub kegiatan"
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
        await ctx.db.subKegiatan.delete({ where: { id } })
        return {
          ok: true,
          message: "Berhasil menghapus sub Kegiatan"
        }
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "An unexpected error occurred, please try again later.",
          cause: error,
        });
      }
    }),
  getSelect: protectedProcedure
    .query(async ({ ctx }) => {
      try {
        const subKegiatan = await ctx.db.subKegiatan.findMany()
        return subKegiatan.map((v) => ({ label: v.name, value: v.id }))
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "An unexpected error occurred, please try again later.",
          cause: error,
        });
      }
    }),
  getSelectByAnggaran: protectedProcedure
    .input(z.object({ dinasId: z.string().optional() }))
    .query(async ({ ctx, input }) => {
      const { dinasId } = input
      try {
        const dpa = await ctx.db.anggaranDPA.findMany({
          where: { dinasId, tahun: new Date().getFullYear() }
        })

        const subDpa = await ctx.db.anggaranDPASub.findMany({
          where: {
            dpaId: {
              in: dpa.map((v) => v.id)
            }
          },
        })

        const subKegiatan = await ctx.db.subKegiatan.findMany({
          where: { id: { in: subDpa.map((v) => v.subKegiatanId) } }
        })
        return subKegiatan.map((v) => ({ label: v.name, value: v.id }))
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "An unexpected error occurred, please try again later.",
          cause: error,
        });
      }
    }),
});
