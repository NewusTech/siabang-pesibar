import { TRPCError } from "@trpc/server";
import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
} from "~/server/api/trpc";

export const organisasiRouter = createTRPCRouter({
  get: protectedProcedure
    .query(async ({ ctx }) => {
      const result = await ctx.db.organisasi.findMany({
        orderBy: [{ createdAt: 'desc' }]
      })
      return result.map((v) => ({
        ...v,
        action: 'Action'
      }))
    }),
  add: protectedProcedure
    .input(z.object({ name: z.string(), kode: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { kode, name } = input
      try {
        await ctx.db.organisasi.create({ data: { kode, name } })
        return {
          ok: true,
          message: "Berhasil menambah organisasi"
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
    .input(z.object({ id: z.string(), name: z.string(), kode: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { kode, name, id } = input
      try {
        await ctx.db.organisasi.update({ data: { kode, name }, where: { id } })

        return {
          ok: true,
          message: "Berhasil mengubah organisasi"
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
        await ctx.db.organisasi.delete({ where: { id } })
        return {
          ok: true,
          message: "Berhasil menghapus organisasi"
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
        const organisasi = await ctx.db.organisasi.findMany()
        return organisasi.map((v) => ({ label: v.name, value: v.id }))
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "An unexpected error occurred, please try again later.",
          cause: error,
        });
      }
    })
});
