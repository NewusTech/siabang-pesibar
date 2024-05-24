import { TRPCError } from "@trpc/server";
import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
} from "~/server/api/trpc";

export const kegiatanRouter = createTRPCRouter({
  get: protectedProcedure
    .query(async ({ ctx }) => {
      const result = await ctx.db.kegiatan.findMany({
        orderBy: [{ createdAt: 'desc' }]
      })

      return result.map((v, i) => ({
        id: v.id,
        no: i + 1,
        kode: v.kode,
        name: v.name,
      }))
    }),
    getbyid: protectedProcedure
    .input(z.object({ programId: z.string().optional() }))
    .query(async ({ ctx, input }) => {
      const { programId } = input

      const result = await ctx.db.kegiatan.findMany({
        where: {
          programId
        },
        orderBy: [{ createdAt: 'desc' }]
      })
      return result.map((v) => ({
        ...v,
        action: 'Action'
      }))
    }),
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
  add: protectedProcedure
    .input(z.object({  name: z.string(), kode: z.string(), programId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { name, kode, programId } = input
      try {
        await ctx.db.kegiatan.create({ data: { name, kode, programId } })
        return {
          ok: true,
          message: "Berhasil menambah kegiatan"
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
    .input(z.object({  id: z.string(), name: z.string(), kode: z.string(), programId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { name, id, kode, programId } = input
      try {
        await ctx.db.kegiatan.update({ data: { name, kode, programId }, where: { id } })

        return {
          ok: true,
          message: "Berhasil mengubah kegiatan"
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
        await ctx.db.kegiatan.delete({ where: { id } })
        return {
          ok: true,
          message: "Berhasil menghapus kegiatan"
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
