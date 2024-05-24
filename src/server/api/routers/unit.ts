import { TRPCError } from "@trpc/server";
import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
} from "~/server/api/trpc";

export const unitRouter = createTRPCRouter({
  get: protectedProcedure
    .input(z.object({ organisasiId: z.string().optional() }))
    .query(async ({ ctx, input }) => {
      const { organisasiId } = input

      const result = await ctx.db.unit.findMany({
        where: {
          organisasiId
        },
        orderBy: [{ createdAt: 'desc' }]
      })
      return result.map((v) => ({
        ...v,
        action: 'Action'
      }))
    }),
    add: protectedProcedure
    .input(z.object({ name: z.string(), kode: z.string(), organisasiId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { kode, name, organisasiId } = input
      try {
        await ctx.db.unit.create({ data: { kode, name, organisasiId } })
        return {
          ok: true,
          message: "Berhasil menambah unit"
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
    .input(z.object({ id: z.string(), name: z.string(), kode: z.string(), organisasiId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { kode, name, id, organisasiId } = input
      try {
        await ctx.db.unit.update({ data: { kode, name, organisasiId }, where: { id } })

        return {
          ok: true,
          message: "Berhasil mengubah unit"
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
        await ctx.db.unit.delete({ where: { id } })
        return {
          ok: true,
          message: "Berhasil menghapus unit"
        }
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "An unexpected error occurred, please try again later.",
          cause: error,
        });
      }
    }),
  getSelect: protectedProcedure
    .query(async ({ ctx }) => {
      try {
        const unit = await ctx.db.unit.findMany()
        return unit.map((v) => ({ label: v.name, value: v.id }))
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "An unexpected error occurred, please try again later.",
          cause: error,
        });
      }
    })
});
