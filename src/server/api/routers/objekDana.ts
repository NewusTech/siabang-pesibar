import { TRPCError } from "@trpc/server";
import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
} from "~/server/api/trpc";

export const objekDanaRouter = createTRPCRouter({
  get: protectedProcedure
    .input(z.object({ jenisDanaId: z.string().optional() }))
    .query(async ({ ctx, input }) => {
      const { jenisDanaId } = input

      const result = await ctx.db.objekDana.findMany({
        where: {
          jenisDanaId
        },
        orderBy: [{ createdAt: 'desc' }]
      })
      return result.map((v) => ({
        ...v,
        action: 'Action'
      }))
    }),
    add: protectedProcedure
    .input(z.object({ name: z.string(), kode: z.string(), jenisDanaId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { kode, name, jenisDanaId } = input
      try {
        await ctx.db.objekDana.create({ data: { kode, name, jenisDanaId } })
        return {
          ok: true,
          message: "Berhasil menambah objekDana"
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
    .input(z.object({ id: z.string(), name: z.string(), kode: z.string(), jenisDanaId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { kode, name, id, jenisDanaId } = input
      try {
        await ctx.db.objekDana.update({ data: { kode, name, jenisDanaId }, where: { id } })

        return {
          ok: true,
          message: "Berhasil mengubah objekDana"
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
        await ctx.db.objekDana.delete({ where: { id } })
        return {
          ok: true,
          message: "Berhasil menghapus objekDana"
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
