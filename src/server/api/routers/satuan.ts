import { TRPCError } from "@trpc/server";
import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
} from "~/server/api/trpc";

export const satuanRouter = createTRPCRouter({
  get: protectedProcedure
    .query(async ({ ctx }) => {
      const result = await ctx.db.satuan.findMany({
        orderBy: [{ createdAt: 'desc' }]
      })
      return result.map((v) => ({
        ...v,
        action: 'Action'
      }))
    }),
  add: protectedProcedure
    .input(z.object({ name: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { name } = input
      try {
        const asdf = await ctx.db.satuan.create({ data: { name } })
        console.log("adf", asdf)
        return {
          ok: true,
          message: "Berhasil menambah satuan"
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
    .input(z.object({ id: z.string(), name: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { name, id } = input
      try {
        await ctx.db.satuan.update({ data: { name }, where: { id } })

        return {
          ok: true,
          message: "Berhasil mengubah satuan"
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
        await ctx.db.satuan.delete({ where: { id } })
        return {
          ok: true,
          message: "Berhasil menghapus satuan"
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
