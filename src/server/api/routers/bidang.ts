import { TRPCError } from "@trpc/server";
import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
} from "~/server/api/trpc";

export const bidangRouter = createTRPCRouter({
  get: protectedProcedure
    .input(z.object({ urusanId: z.string().optional() }))
    .query(async ({ ctx, input }) => {
      const { urusanId } = input

      const result = await ctx.db.bidang.findMany({
        where: {
          urusanId
        },
        orderBy: [{ createdAt: 'desc' }]
      })
      return result.map((v) => ({
        ...v,
        action: 'Action'
      }))
    }),
    add: protectedProcedure
    .input(z.object({ name: z.string(), kode: z.string(), urusanId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { kode, name, urusanId } = input
      try {
        await ctx.db.bidang.create({ data: { kode, name, urusanId } })
        return {
          ok: true,
          message: "Berhasil menambah bidang"
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
    .input(z.object({ id: z.string(), name: z.string(), kode: z.string(), urusanId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { kode, name, id, urusanId } = input
      try {
        await ctx.db.bidang.update({ data: { kode, name, urusanId }, where: { id } })

        return {
          ok: true,
          message: "Berhasil mengubah bidang"
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
        await ctx.db.bidang.delete({ where: { id } })
        return {
          ok: true,
          message: "Berhasil menghapus bidang"
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
        const bidang = await ctx.db.bidang.findMany()
        return bidang.map((v) => ({ label: v.name, value: v.id }))
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "An unexpected error occurred, please try again later.",
          cause: error,
        });
      }
    })
});
