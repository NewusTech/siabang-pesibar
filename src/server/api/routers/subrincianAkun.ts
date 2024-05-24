import { TRPCError } from "@trpc/server";
import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
} from "~/server/api/trpc";

export const subrincianObjekAkunRouter = createTRPCRouter({
  get: protectedProcedure
    .input(z.object({ rincianAkunId: z.string().optional() }))
    .query(async ({ ctx, input }) => {
      const { rincianAkunId } = input

      const result = await ctx.db.subRincianObjekAkun.findMany({
        where: {
          rincianAkunId
        },
        orderBy: [{ createdAt: 'desc' }]
      })
      return result.map((v) => ({
        ...v,
        action: 'Action'
      }))
    }),
    add: protectedProcedure
    .input(z.object({ name: z.string(), kode: z.string(), rincianAkunId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { kode, name, rincianAkunId } = input
      try {
        await ctx.db.subRincianObjekAkun.create({ data: { kode, name, rincianAkunId } })
        return {
          ok: true,
          message: "Berhasil menambah subrincianObjekAkun"
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
    .input(z.object({ id: z.string(), name: z.string(), kode: z.string(), rincianAkunId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { kode, name, id, rincianAkunId } = input
      try {
        await ctx.db.subRincianObjekAkun.update({ data: { kode, name, rincianAkunId }, where: { id } })

        return {
          ok: true,
          message: "Berhasil mengubah subrincianObjekAkun"
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
        await ctx.db.subRincianObjekAkun.delete({ where: { id } })
        return {
          ok: true,
          message: "Berhasil menghapus subrincianObjekAkun"
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
