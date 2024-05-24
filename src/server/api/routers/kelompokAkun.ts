import { TRPCError } from "@trpc/server";
import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
} from "~/server/api/trpc";

export const kelompokAkunRouter = createTRPCRouter({
  get: protectedProcedure
    .input(z.object({ sumberAkunId: z.string().optional() }))
    .query(async ({ ctx, input }) => {
      const { sumberAkunId } = input

      const result = await ctx.db.kelompokAkun.findMany({
        where: {
          sumberAkunId
        },
        orderBy: [{ createdAt: 'desc' }]
      })
      return result.map((v) => ({
        ...v,
        action: 'Action'
      }))
    }),
    add: protectedProcedure
    .input(z.object({ name: z.string(), kode: z.string(), sumberAkunId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { kode, name, sumberAkunId } = input
      try {
        await ctx.db.kelompokAkun.create({ data: { kode, name, sumberAkunId } })
        return {
          ok: true,
          message: "Berhasil menambah kelompokAkun"
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
    .input(z.object({ id: z.string(), name: z.string(), kode: z.string(), sumberAkunId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { kode, name, id, sumberAkunId } = input
      try {
        await ctx.db.kelompokAkun.update({ data: { kode, name, sumberAkunId }, where: { id } })

        return {
          ok: true,
          message: "Berhasil mengubah kelompokAkun"
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
        await ctx.db.kelompokAkun.delete({ where: { id } })
        return {
          ok: true,
          message: "Berhasil menghapus kelompokAkun"
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
