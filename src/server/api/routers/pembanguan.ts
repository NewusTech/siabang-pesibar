import { TRPCError } from "@trpc/server";
import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure,
} from "~/server/api/trpc";

export const pembangunanRouter = createTRPCRouter({
  getList: protectedProcedure
    .query(async ({ ctx }) => {
      const isAdmin = ctx.session.user.dinas

      const result = await ctx.db.pembangunanDPA.findMany({
        where: isAdmin ? {} : { dinasId: ctx.session.user.dinas.id },
        include: { Dinas: true, Kegiatan: { include: { program: { include: { bidang: { include: { urusan: true } } } } } } }
      })

      return result.map((v) => ({
        id: v.id,
        no: v.no,
        dinas: v.Dinas.name,
        tahun: v.tahun,
        urusan: v.Kegiatan?.program.bidang.urusan.name,
      }))
    }),
  get: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const { id } = input
      const dpa = await ctx.db.pembangunanDPA.findFirst({
        where: { id },
        include: { Dinas: true }
      })

      const urusan = await ctx.db.urusan.findMany()
      const bidang = await ctx.db.bidang.findMany()
      const program = await ctx.db.program.findMany()
      const kegiatan = await ctx.db.kegiatan.findMany()
      const organisasi = await ctx.db.organisasi.findMany()
      const unit = await ctx.db.unit.findMany()
      const dinas = await ctx.db.dinas.findMany()

      const rincian = () => {
        const u = unit.find((v) => v.id === dpa?.unitId)
        const o = organisasi.find((v) => v.id === u?.organisasiId)

        const k = kegiatan.find((v) => v.id === dpa?.kegiatanId)
        const p = program.find((v) => v.id === k?.programId)
        const b = bidang.find((v) => v.id === p?.bidangId)
        const ur = urusan.find((v) => v.id === b?.urusanId)

        return {
          urusan: ur,
          bidang: b,
          program: p,
          kegiatan: k,

          organisasi: o,
          unit: u
        }
      }

      return {
        urusan: urusan.map((v) => ({ label: v.name, value: v.id, kode: v.kode })),
        bidang: bidang.map((v) => ({ label: v.name, value: v.id, urusanId: v.urusanId, kode: v.kode })),
        program: program.map((v) => ({ label: v.name, value: v.id, bidangId: v.bidangId, kode: v.kode })),
        kegiatan: kegiatan.map((v) => ({ label: v.name, value: v.id, programId: v.programId, kode: v.kode })),
        organisasi: organisasi.map((v) => ({ label: v.name, value: v.id, kode: v.kode })),
        unit: unit.map((v) => ({ label: v.name, value: v.id, organisasiId: v.organisasiId, kode: v.kode })),
        dpa,
        rincian: rincian(),
        dinas: dinas.map((v) => ({ label: v.name, value: v.id }))
      }
    }),
  setInformasi: protectedProcedure
    .input(z.object({ id: z.string(), no: z.string(), jumlahAlokasi: z.number(), dinas: z.string().nullable() }))
    .mutation(async ({ ctx, input }) => {
      const { id, no, jumlahAlokasi, dinas } = input

      const isEdit = id !== 'tambah'

      if (isEdit) {
        try {
          const res = await ctx.db.$transaction(async (v) => {
            const result = await v.pembangunanDPA.update({
              where: { id },
              data: {
                no,
                jumlahAlokasi,
                sisaAlokasi: jumlahAlokasi,
                dinasId: dinas ? dinas : ctx.session.user.dinas.id,
                tahun: new Date().getFullYear()
              }
            })

            return result.id
          })

          return {
            ok: true,
            data: res
          }
        } catch (error) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "An unexpected error occurred, please try again later.",
            cause: error,
          });
        }
      } else {
        try {
          const res = await ctx.db.$transaction(async (v) => {
            const result = await v.pembangunanDPA.create({
              data: {
                no,
                jumlahAlokasi,
                sisaAlokasi: jumlahAlokasi,
                dinasId: dinas ? dinas : ctx.session.user.dinas.id,
                tahun: new Date().getFullYear()
              }
            })

            // await v.anggaranDPARencanaPenarikan.createMany({
            //   data: Array.from({ length: 12 }, (_, i) => i + 1).map((v) => ({
            //     bulan: v,
            //     operasi: 0,
            //     modal: 0,
            //     takTerduga: 0,
            //     transfer: 0,
            //     dpaId: result.id
            //   }))
            // })
            return result.id
          })

          return {
            ok: true,
            data: res
          }
        } catch (error) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "An unexpected error occurred, please try again later.",
            cause: error,
          });
        }
      }
    }),
  setRincian: protectedProcedure
    .input(z.object({ id: z.string(), kegiatan: z.string(), unit: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const {
        id,
        kegiatan,
        unit
      } = input

      try {
        await ctx.db.pembangunanDPA.update({
          where: { id },
          data: {
            kegiatanId: kegiatan,
            unitId: unit
          }
        })

        return {
          ok: true,
          message: 'Berhasil membuat rincian'
        }
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "An unexpected error occurred, please try again later.",
          cause: error,
        });
      }
    }),
  getSubKegiatan: protectedProcedure
    .input(z.object({ id: z.string(), kegiatanId: z.string() }))
    .query(async ({ ctx, input }) => {
      const { id, kegiatanId } = input
      try {
        const result = await ctx.db.pembangunanDPASub.findMany({
          where: { dpaId: id },
          include: { SubKegiatan: true, SumberDana: true }
        })
        const subKegiatan = await ctx.db.subKegiatan.findMany({ where: { kegiatanId } })
        const sumberDana = await ctx.db.sumberDana.findMany()

        return {
          data: result,
          subKegiatan: subKegiatan.map((v) => ({ label: v.name, value: v.id, kode: v.kode })),
          sumberDana: sumberDana.map((v) => ({ label: v.name, value: v.id }))
        }

      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "An unexpected error occurred, please try again later.",
          cause: error,
        });
      }
    }),
  deleteSubKegiatan: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { id } = input
      try {

        await ctx.db.pembangunanDPASub.delete({ where: { id } })

        return {
          ok: true,
          message: "Berhasil menghapus subkegiatan"
        }
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "An unexpected error occurred, please try again later.",
          cause: error,
        });
      }

    }),
  addSubkegiatan: protectedProcedure
    .input(z.object({
      dpaId: z.string(),
      subKegiatan: z.string(),
      sumberDana: z.string(),
      pagu: z.number(),
    }))
    .mutation(async ({ ctx, input }) => {
      const {
        subKegiatan,
        sumberDana,
        pagu,
        dpaId
      } = input

      try {
        await ctx.db.$transaction([
          ctx.db.pembangunanDPASub.create({
            data: {
              subKegiatanId: subKegiatan,
              sumberDanaId: sumberDana,
              pagu,
              dpaId
            }
          }),
          ctx.db.pembangunanDPA.update({
            where: { id: dpaId },
            data: {
              teralokasi: ({ increment: pagu }),
              sisaAlokasi: ({ decrement: pagu }),
            }
          })
        ])

        return {
          ok: true,
          message: 'Berhasil menambah Sub Kegiatan'
        }
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "An unexpected error occurred, please try again later.",
          cause: error,
        });
      }
      // TODO: kalau mau update jumlahAlokasi hitung lagi teralokasi dan sisaAlokasi
    }),
  updateSubkegiatan: protectedProcedure
    .input(z.object({
      id: z.string(),
      dpaId: z.string(),
      subKegiatan: z.string(),
      sumberDana: z.string(),
      pagu: z.number(),
    }))
    .mutation(async ({ ctx, input }) => {
      const {
        subKegiatan,
        sumberDana,
        pagu,
        dpaId,
        id
      } = input

      try {
        await ctx.db.$transaction([
          ctx.db.pembangunanDPASub.update({
            data: {
              subKegiatanId: subKegiatan,
              sumberDanaId: sumberDana,
              pagu,
              dpaId
            }, where: { id: id }
          }),
          ctx.db.pembangunanDPA.update({
            where: { id: dpaId },
            data: {
              teralokasi: ({ increment: pagu }),
              sisaAlokasi: ({ decrement: pagu }),
            }
          })
        ])

        return {
          ok: true,
          message: 'Berhasil menambah Sub Kegiatan'
        }
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "An unexpected error occurred, please try again later.",
          cause: error,
        });
      }
      // TODO: kalau mau update jumlahAlokasi hitung lagi teralokasi dan sisaAlokasi
    }),
  getanggaran: protectedProcedure
    .input(z.object({ selectedDinas: z.string().optional(), selectedMonth: z.string().optional(), selectedYear: z.string().optional() }))
    .query(async ({ ctx, input }) => {
      const { selectedDinas, selectedMonth, selectedYear } = input

      const dinasId = selectedDinas || "";
      const getmonth = selectedMonth || "";
      const getyear = selectedYear || "";

      const month = parseInt(getmonth);
      const year = parseInt(getyear);

      let whereCondition: any = {};

      if (dinasId !== "") {
        whereCondition = {
          dinasId: dinasId
        };
      }

      if (selectedMonth && selectedMonth !== "") {
        const currentYear = new Date().getFullYear();

        let startDate;
        let endDate;
        if (year) {
          startDate = new Date(year, month - 1, 1);
          endDate = new Date(year, month, 0);
        } else {
          startDate = new Date(currentYear, month - 1, 2);
          endDate = new Date(currentYear, month, 0);
        }

        whereCondition.createdAt = {
          gte: startDate,
          lt: endDate
        };
      }

      if (selectedYear && selectedYear !== "") {
        let startDate;
        let endDate;

        if (month) {
          startDate = new Date(year, month - 1, 2);
          endDate = new Date(year, month, 0);
        } else {
          startDate = new Date(year, 0, 2);
          endDate = new Date(year, 12, 0);
        }

        whereCondition.createdAt = {
          gte: startDate,
          lt: endDate
        };
      }

      console.log(whereCondition)

      const result = await ctx.db.pembangunanDPA.findMany({
        where: whereCondition,
        orderBy: [{ createdAt: 'desc' }],
        include: {
          Kegiatan: {
            include: {
              program: true
            }
          }
        }
      })

      const totalJumlahAlokasi = result.reduce((total, anggaran) => total + (anggaran.jumlahAlokasi ?? 0), 0);
      const totalTeralokasi = result.reduce((total, anggaran) => total + (anggaran.teralokasi ?? 0), 0);
      const totalpersen = Math.round(totalTeralokasi / totalJumlahAlokasi * 100);

      const dinas = await ctx.db.dinas.findMany()
      return {
        anggaran: result,
        dinas: dinas.map((v) => ({ label: v.name, value: v.id })),
        totalJumlahAlokasi,
        totalTeralokasi,
        totalpersen,
      }
    }),
})