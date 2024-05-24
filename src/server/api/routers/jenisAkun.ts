import { TRPCError } from "@trpc/server";
import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
} from "~/server/api/trpc";

export const jenisAkunRouter = createTRPCRouter({
  get: protectedProcedure
    .input(z.object({ kelompokAkunId: z.string().optional() }))
    .query(async ({ ctx, input }) => {
      const { kelompokAkunId } = input

      const result = await ctx.db.jenisAkun.findMany({
        where: {
          kelompokAkunId
        },
        orderBy: [{ createdAt: 'desc' }]
      })
      return result.map((v) => ({
        ...v,
        action: 'Action'
      }))
    }),
    add: protectedProcedure
    .input(z.object({ name: z.string(), kode: z.string(), kelompokAkunId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { kode, name, kelompokAkunId } = input
      try {
        await ctx.db.jenisAkun.create({ data: { kode, name, kelompokAkunId } })
        return {
          ok: true,
          message: "Berhasil menambah jenisAkun"
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
    .input(z.object({ id: z.string(), name: z.string(), kode: z.string(), kelompokAkunId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { kode, name, id, kelompokAkunId } = input
      try {
        await ctx.db.jenisAkun.update({ data: { kode, name, kelompokAkunId }, where: { id } })

        return {
          ok: true,
          message: "Berhasil mengubah jenisAkun"
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
        await ctx.db.jenisAkun.delete({ where: { id } })
        return {
          ok: true,
          message: "Berhasil menghapus jenisAkun"
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
