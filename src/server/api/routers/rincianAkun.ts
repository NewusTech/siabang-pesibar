import { TRPCError } from "@trpc/server";
import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
} from "~/server/api/trpc";

export const rincianObjekAkunRouter = createTRPCRouter({
  get: protectedProcedure
    .input(z.object({ objekAkunId: z.string().optional() }))
    .query(async ({ ctx, input }) => {
      const { objekAkunId } = input

      const result = await ctx.db.rincianObjekAkun.findMany({
        where: {
          objekAkunId
        },
        orderBy: [{ createdAt: 'desc' }]
      })
      return result.map((v) => ({
        ...v,
        action: 'Action'
      }))
    }),
    add: protectedProcedure
    .input(z.object({ name: z.string(), kode: z.string(), objekAkunId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { kode, name, objekAkunId } = input
      try {
        await ctx.db.rincianObjekAkun.create({ data: { kode, name, objekAkunId } })
        return {
          ok: true,
          message: "Berhasil menambah rincianObjekAkun"
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
    .input(z.object({ id: z.string(), name: z.string(), kode: z.string(), objekAkunId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { kode, name, id, objekAkunId } = input
      try {
        await ctx.db.rincianObjekAkun.update({ data: { kode, name, objekAkunId }, where: { id } })

        return {
          ok: true,
          message: "Berhasil mengubah rincianObjekAkun"
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
        await ctx.db.rincianObjekAkun.delete({ where: { id } })
        return {
          ok: true,
          message: "Berhasil menghapus rincianObjekAkun"
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
