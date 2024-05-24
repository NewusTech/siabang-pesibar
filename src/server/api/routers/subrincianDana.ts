import { TRPCError } from "@trpc/server";
import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
} from "~/server/api/trpc";

export const subrincianObjekDanaRouter = createTRPCRouter({
  get: protectedProcedure
    .input(z.object({ rincianDanaId: z.string().optional() }))
    .query(async ({ ctx, input }) => {
      const { rincianDanaId } = input

      const result = await ctx.db.subRincianObjekDana.findMany({
        where: {
          rincianDanaId
        },
        orderBy: [{ createdAt: 'desc' }]
      })
      return result.map((v) => ({
        ...v,
        action: 'Action'
      }))
    }),
    add: protectedProcedure
    .input(z.object({ name: z.string(), kode: z.string(), rincianDanaId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { kode, name, rincianDanaId } = input
      try {
        await ctx.db.subRincianObjekDana.create({ data: { kode, name, rincianDanaId } })
        return {
          ok: true,
          message: "Berhasil menambah subrincianObjekDana"
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
    .input(z.object({ id: z.string(), name: z.string(), kode: z.string(), rincianDanaId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { kode, name, id, rincianDanaId } = input
      try {
        await ctx.db.subRincianObjekDana.update({ data: { kode, name, rincianDanaId }, where: { id } })

        return {
          ok: true,
          message: "Berhasil mengubah subrincianObjekDana"
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
        await ctx.db.subRincianObjekDana.delete({ where: { id } })
        return {
          ok: true,
          message: "Berhasil menghapus subrincianObjekDana"
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
