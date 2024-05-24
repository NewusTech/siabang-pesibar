import { TRPCError } from "@trpc/server";
import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
} from "~/server/api/trpc";

export const jenisDanaRouter = createTRPCRouter({
  get: protectedProcedure
    .input(z.object({ kelompokDanaId: z.string().optional() }))
    .query(async ({ ctx, input }) => {
      const { kelompokDanaId } = input

      const result = await ctx.db.jenisDana.findMany({
        where: {
          kelompokDanaId
        },
        orderBy: [{ createdAt: 'desc' }]
      })
      return result.map((v) => ({
        ...v,
        action: 'Action'
      }))
    }),
    add: protectedProcedure
    .input(z.object({ name: z.string(), kode: z.string(), kelompokDanaId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { kode, name, kelompokDanaId } = input
      try {
        await ctx.db.jenisDana.create({ data: { kode, name, kelompokDanaId } })
        return {
          ok: true,
          message: "Berhasil menambah jenisDana"
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
    .input(z.object({ id: z.string(), name: z.string(), kode: z.string(), kelompokDanaId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { kode, name, id, kelompokDanaId } = input
      try {
        await ctx.db.jenisDana.update({ data: { kode, name, kelompokDanaId }, where: { id } })

        return {
          ok: true,
          message: "Berhasil mengubah jenisDana"
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
        await ctx.db.jenisDana.delete({ where: { id } })
        return {
          ok: true,
          message: "Berhasil menghapus jenisDana"
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
