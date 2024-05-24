import { TRPCError } from "@trpc/server";
import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
} from "~/server/api/trpc";

export const sumberDanaRouter = createTRPCRouter({
  get: protectedProcedure
    .query(async ({ ctx }) => {
      const result = await ctx.db.sumberDana.findMany({
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
      const { name, kode } = input
      try {
        await ctx.db.sumberDana.create({ data: { name, kode } })
        return {
          ok: true,
          message: "Berhasil menambah sumberDana"
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
      const { name, kode, id } = input
      try {
        await ctx.db.sumberDana.update({ data: { name, kode }, where: { id } })

        return {
          ok: true,
          message: "Berhasil mengubah sumberDana"
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
        await ctx.db.sumberDana.delete({ where: { id } })
        return {
          ok: true,
          message: "Berhasil menghapus sumberDana"
        }
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "An unexpected error occurred, please try again later.",
          cause: error,
        });
      }

    })
});
