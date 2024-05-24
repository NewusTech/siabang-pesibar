import { TRPCError } from "@trpc/server";
import { z } from "zod";
const bcrypt = require('bcrypt');

import {
  createTRPCRouter,
  protectedProcedure,
} from "~/server/api/trpc";

export const userRouter = createTRPCRouter({
  get: protectedProcedure
    .input(z.object({ id: z.string().optional().nullable() }))
    .query(async ({ ctx }) => {
      const result = await ctx.db.user.findMany({
        include: { Dinas: true }
      })

      return result.map((v) => ({
        ...v,
        action: 'Action'
      }))
    }),
    getbyid: protectedProcedure
    .input(z.object({ id: z.string().optional() }))
    .query(async ({ ctx, input }) => {
      const { id } = input

      const result = await ctx.db.user.findMany({
        where: {
          id
        },
        include: { Dinas: true }
      })

      const dinas = await ctx.db.dinas.findMany()

      return result.map((v) => ({
        ...v,
        dinas: dinas.map((v) => ({ label: v.name, value: v.id })),
        action: 'Action'
      }))
    }),
  add: protectedProcedure
    .input(z.object({ name: z.string(), password: z.string(), email: z.string(), role: z.string(), dinasId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { name, email, role, dinasId } = input;
      const password = await bcrypt.hash(input.password, 10);
      
      try {
        await ctx.db.user.create({ data: { name, email, password, role, dinasId } })
        return {
          ok: true,
          message: "Berhasil menambah akun user"
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
    .input(z.object({ id: z.string(), name: z.string(), email: z.string(), password: z.string(), role: z.string(), dinasId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { name, email, password, role, dinasId, id } = input
      try {
        await ctx.db.user.update({ data: { name, email, password, role, dinasId }, where: { id } })

        return {
          ok: true,
          message: "Berhasil mengubah user"
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
        await ctx.db.user.delete({ where: { id } })
        return {
          ok: true,
          message: "Berhasil menghapus user"
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
        const dinas = await ctx.db.dinas.findMany()
        return dinas.map((v) => ({ label: v.name, value: v.id }))
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "An unexpected error occurred, please try again later.",
          cause: error,
        });
      }
    })
});
