import { TRPCError } from "@trpc/server";
import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
} from "~/server/api/trpc";

export const kelompokDanaRouter = createTRPCRouter({
  get: protectedProcedure
    .input(z.object({ sumberDanaId: z.string().optional() }))
    .query(async ({ ctx, input }) => {
      const { sumberDanaId } = input

      const result = await ctx.db.kelompokDana.findMany({
        where: {
          sumberDanaId
        },
        orderBy: [{ createdAt: 'desc' }]
      })
      return result.map((v) => ({
        ...v,
        action: 'Action'
      }))
    }),
    add: protectedProcedure
    .input(z.object({ name: z.string(), kode: z.string(), sumberDanaId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { kode, name, sumberDanaId } = input
      try {
        await ctx.db.kelompokDana.create({ data: { kode, name, sumberDanaId } })
        return {
          ok: true,
          message: "Berhasil menambah kelompokDana"
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
    .input(z.object({ id: z.string(), name: z.string(), kode: z.string(), sumberDanaId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { kode, name, id, sumberDanaId } = input
      try {
        await ctx.db.kelompokDana.update({ data: { kode, name, sumberDanaId }, where: { id } })

        return {
          ok: true,
          message: "Berhasil mengubah kelompokDana"
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
        await ctx.db.kelompokDana.delete({ where: { id } })
        return {
          ok: true,
          message: "Berhasil menghapus kelompokDana"
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
