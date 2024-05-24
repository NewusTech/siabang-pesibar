import { TRPCError } from "@trpc/server";
import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
} from "~/server/api/trpc";

export const objekAkunRouter = createTRPCRouter({
  get: protectedProcedure
    .input(z.object({ jenisAkunId: z.string().optional() }))
    .query(async ({ ctx, input }) => {
      const { jenisAkunId } = input

      const result = await ctx.db.objekAkun.findMany({
        where: {
          jenisAkunId
        },
        orderBy: [{ createdAt: 'desc' }]
      })
      return result.map((v) => ({
        ...v,
        action: 'Action'
      }))
    }),
    add: protectedProcedure
    .input(z.object({ name: z.string(), kode: z.string(), jenisAkunId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { kode, name, jenisAkunId } = input
      try {
        await ctx.db.objekAkun.create({ data: { kode, name, jenisAkunId } })
        return {
          ok: true,
          message: "Berhasil menambah objekAkun"
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
    .input(z.object({ id: z.string(), name: z.string(), kode: z.string(), jenisAkunId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { kode, name, id, jenisAkunId } = input
      try {
        await ctx.db.objekAkun.update({ data: { kode, name, jenisAkunId }, where: { id } })

        return {
          ok: true,
          message: "Berhasil mengubah objekAkun"
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
        await ctx.db.objekAkun.delete({ where: { id } })
        return {
          ok: true,
          message: "Berhasil menghapus objekAkun"
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
