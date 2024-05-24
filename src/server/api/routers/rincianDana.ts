import { TRPCError } from "@trpc/server";
import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
} from "~/server/api/trpc";

export const rincianObjekDanaRouter = createTRPCRouter({
  get: protectedProcedure
    .input(z.object({ objekDanaId: z.string().optional() }))
    .query(async ({ ctx, input }) => {
      const { objekDanaId } = input

      const result = await ctx.db.rincianObjekDana.findMany({
        where: {
          objekDanaId
        },
        orderBy: [{ createdAt: 'desc' }]
      })
      return result.map((v) => ({
        ...v,
        action: 'Action'
      }))
    }),
    add: protectedProcedure
    .input(z.object({ name: z.string(), kode: z.string(), objekDanaId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { kode, name, objekDanaId } = input
      try {
        await ctx.db.rincianObjekDana.create({ data: { kode, name, objekDanaId } })
        return {
          ok: true,
          message: "Berhasil menambah rincianObjekDana"
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
    .input(z.object({ id: z.string(), name: z.string(), kode: z.string(), objekDanaId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { kode, name, id, objekDanaId } = input
      try {
        await ctx.db.rincianObjekDana.update({ data: { kode, name, objekDanaId }, where: { id } })

        return {
          ok: true,
          message: "Berhasil mengubah rincianObjekDana"
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
        await ctx.db.rincianObjekDana.delete({ where: { id } })
        return {
          ok: true,
          message: "Berhasil menghapus rincianObjekDana"
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
