import { TRPCError } from "@trpc/server";
import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
} from "~/server/api/trpc";

export const programRouter = createTRPCRouter({
  get: protectedProcedure
    .query(async ({ ctx }) => {
      const result = await ctx.db.program.findMany({
        orderBy: [{ createdAt: 'desc' }]
      })

      return result.map((v, i) => ({
        id: v.id,
        no: i + 1,
        kode: v.kode,
        name: v.name,
      }))


    }),
    getbyid: protectedProcedure
    .input(z.object({ bidangId: z.string().optional() }))
    .query(async ({ ctx, input }) => {
      const { bidangId } = input

      const result = await ctx.db.program.findMany({
        where: {
          bidangId
        },
        orderBy: [{ createdAt: 'desc' }]
      })
      return result.map((v) => ({
        ...v,
        action: 'Action'
      }))
    }),
  add: protectedProcedure
    .input(z.object({ name: z.string(), kode: z.string(), bidangId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { name, kode, bidangId } = input
      try {
        await ctx.db.program.create({ data: { name, kode, bidangId } })
        return {
          ok: true,
          message: "Berhasil menambah program"
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
    .input(z.object({ id: z.string(), name: z.string(), kode: z.string(), bidangId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { name, id, kode, bidangId } = input
      try {
        await ctx.db.program.update({ data: { kode, name, bidangId }, where: { id } })

        return {
          ok: true,
          message: "Berhasil mengubah program"
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
        await ctx.db.program.delete({ where: { id } })
        return {
          ok: true,
          message: "Berhasil menghapus program"
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
