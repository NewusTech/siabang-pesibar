import { TRPCError } from "@trpc/server";
import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
} from "~/server/api/trpc";

export const anggaranRouter = createTRPCRouter({
  getList: protectedProcedure
    .query(async ({ ctx }) => {
      const isAdmin = ctx.session.user.role

      const result = await ctx.db.anggaranDPA.findMany({
        where: isAdmin === 'admin' ? {} : { dinasId: ctx.session.user.dinas.id },
        include: { Dinas: true, Kegiatan: { include: { program: { include: { bidang: { include: { urusan: true } } } } } } }
      })

      return result.map((v) => ({
        id: v.id,
        no: v.no,
        dinas: v.Dinas.name,
        tahun: v.tahun,
        urusan: v.Kegiatan?.program?.bidang.urusan.name,
      }))


    })
  ,
  get: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const { id } = input
      const dpa = await ctx.db.anggaranDPA.findFirst({
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
    .input(z.object({ id: z.string(), no: z.string(), jumlahAlokasi: z.number(), dinas: z.string().nullable(), dateline: z.date().optional().nullable() }))
    .mutation(async ({ ctx, input }) => {
      const { id, no, jumlahAlokasi, dinas, dateline } = input

      const isEdit = id !== 'tambah'

      if (isEdit) {
        try {
          const res = await ctx.db.$transaction(async (v) => {
            const result = await v.anggaranDPA.update({
              where: { id },
              data: {
                no,
                jumlahAlokasi,
                sisaAlokasi: jumlahAlokasi,
                dinasId: dinas ? dinas : ctx.session.user.dinas.id,
                tahun: new Date().getFullYear(),
                dateline: dateline
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
            const result = await v.anggaranDPA.create({
              data: {
                no,
                jumlahAlokasi,
                sisaAlokasi: jumlahAlokasi,
                dinasId: dinas ? dinas : ctx.session.user.dinas.id,
                tahun: new Date().getFullYear(),
                dateline: dateline
              }
            })

            await v.anggaranDPARencanaPenarikan.createMany({
              data: Array.from({ length: 12 }, (_, i) => i + 1).map((v) => ({
                bulan: v,
                operasi: 0,
                modal: 0,
                takTerduga: 0,
                transfer: 0,
                dpaId: result.id
              }))
            })


            const isTahunExist = await v.tahun.findFirst({ where: { name: new Date().getFullYear() } })
            if (!isTahunExist) {
              await v.tahun.create({ data: { name: new Date().getFullYear() } })
            }
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
        await ctx.db.anggaranDPA.update({
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
        const result = await ctx.db.anggaranDPASub.findMany({
          where: { dpaId: id },
          include: { subkegiatan: true, SumberDana: true }
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

        await ctx.db.$transaction(async (v) => {
          const subDpa = await v.anggaranDPASub.findFirst({
            where: { id }
          })
          const dpa = await v.anggaranDPA.update({
            where: { id: subDpa?.dpaId },
            data: {
              teralokasi: { decrement: subDpa?.total },
              sisaAlokasi: { increment: subDpa?.total },
              operasi: { decrement: subDpa?.operasi },
              osisaAlokasi: { decrement: subDpa?.operasi },
              modal: { decrement: subDpa?.modal },
              msisaAlokasi: { decrement: subDpa?.modal },
              takTerduga: { decrement: subDpa?.takTerduga },
              ttsisaAlokasi: { decrement: subDpa?.takTerduga },
              transfer: { decrement: subDpa?.transfer },
              tsisaAlokasi: { decrement: subDpa?.transfer },
            }
          })
          if (dpa) {
            await v.anggaranDPASub.delete({ where: { id } })
          }
        })
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
      lokasi: z.string(),
      target: z.string(),
      waktu: z.string(),
      keterangan: z.string(),
      operasi: z.number(),
      modal: z.number(),
      takTerduga: z.number(),
      transfer: z.number()
    }))
    .mutation(async ({ ctx, input }) => {
      const {
        subKegiatan,
        sumberDana,
        lokasi,
        target,
        waktu,
        keterangan,
        operasi,
        modal,
        takTerduga,
        transfer,
        dpaId
      } = input

      const total = operasi + modal + takTerduga + transfer

      try {
        await ctx.db.$transaction(async (v) => {
          await v.anggaranDPASub.create({
            data: {
              subKegiatanId: subKegiatan,
              sumberDanaId: sumberDana,
              lokasi,
              target,
              waktuPelaksanaan: waktu,
              keterangan,
              operasi,
              modal,
              takTerduga,
              transfer,
              total,
              dpaId
            }
          })
          const dpa = await v.anggaranDPA.update({
            where: { id: dpaId },
            data: {
              teralokasi: ({ increment: total }),
              sisaAlokasi: ({ decrement: total }),
              operasi: { increment: operasi },
              osisaAlokasi: { increment: operasi },
              modal: { increment: modal },
              msisaAlokasi: { increment: modal },
              takTerduga: { increment: takTerduga },
              ttsisaAlokasi: { increment: takTerduga },
              transfer: { increment: transfer },
              tsisaAlokasi: { increment: transfer },
            }
          })

          const realisasi = await v.anggaranRealisasi.findFirst({
            where: {
              subKegiatanId: subKegiatan,
              dinasId: dpa.dinasId,
              tahun: dpa.tahun!
            }
          })

          if (!realisasi) {
            const asdf = await v.anggaranRealisasi.create({
              data: {
                subKegiatanId: subKegiatan,
                dinasId: dpa.dinasId,
                tahun: dpa.tahun!,
                pagu: total,
                terrealisasi: 0,
                status: "Tidak Tercapai",
                operasi,
                modal,
                takTerduga,
                transfer,
                osisa: operasi,
                msisa: modal,
                ttsisa: takTerduga,
                tsisa: transfer
              }
            })
            await v.anggaranRealisasiPengambilan.createMany({
              data: Array.from({ length: 12 }, (_, i) => i + 1).map((v) => ({
                bulan: v,
                operasi: 0,
                modal: 0,
                takTerduga: 0,
                transfer: 0,
                realisasiId: asdf.id,
                keterangan: ""
              }))
            })
          } else {
            await v.anggaranRealisasi.update({
              where: {
                id: realisasi.id
              },
              data: {
                pagu: { increment: total },
                operasi: { increment: operasi },
                modal: { increment: modal },
                takTerduga: { increment: takTerduga },
                transfer: { increment: transfer }
              }
            })
          }
        })
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
      lokasi: z.string(),
      target: z.string(),
      waktu: z.string(),
      keterangan: z.string(),
      operasi: z.number(),
      modal: z.number(),
      takTerduga: z.number(),
      transfer: z.number()
    }))
    .mutation(async ({ ctx, input }) => {
      const {
        subKegiatan,
        sumberDana,
        lokasi,
        target,
        waktu,
        keterangan,
        operasi,
        modal,
        takTerduga,
        transfer,
        dpaId,
        id
      } = input

      const total = operasi + modal + takTerduga + transfer

      try {
        await ctx.db.$transaction(async (v) => {
          await v.anggaranDPASub.update({
            data: {
              subKegiatanId: subKegiatan,
              sumberDanaId: sumberDana,
              lokasi,
              target,
              waktuPelaksanaan: waktu,
              keterangan,
              operasi,
              modal,
              takTerduga,
              transfer,
              total,
              dpaId
            }
            , where: { id }
          })
          const dpa = await v.anggaranDPA.update({
            where: { id: dpaId },
            data: {
              teralokasi: ({ increment: total }),
              sisaAlokasi: ({ decrement: total }),
              operasi: { increment: operasi },
              osisaAlokasi: { increment: operasi },
              modal: { increment: modal },
              msisaAlokasi: { increment: modal },
              takTerduga: { increment: takTerduga },
              ttsisaAlokasi: { increment: takTerduga },
              transfer: { increment: transfer },
              tsisaAlokasi: { increment: transfer },
            }
          })

          const realisasi = await v.anggaranRealisasi.findFirst({
            where: {
              subKegiatanId: subKegiatan,
              dinasId: dpa.dinasId,
              tahun: dpa.tahun!
            }
          })

          if (!realisasi) {
            const asdf = await v.anggaranRealisasi.create({
              data: {
                subKegiatanId: subKegiatan,
                dinasId: dpa.dinasId,
                tahun: dpa.tahun!,
                pagu: total,
                terrealisasi: 0,
                status: "Tidak Tercapai",
                operasi,
                modal,
                takTerduga,
                transfer,
                osisa: operasi,
                msisa: modal,
                ttsisa: takTerduga,
                tsisa: transfer
              }
            })
            await v.anggaranRealisasiPengambilan.createMany({
              data: Array.from({ length: 12 }, (_, i) => i + 1).map((v) => ({
                bulan: v,
                operasi: 0,
                modal: 0,
                takTerduga: 0,
                transfer: 0,
                realisasiId: asdf.id,
                keterangan: ""
              }))
            })
          } else {
            await v.anggaranRealisasi.update({
              where: {
                id: realisasi.id
              },
              data: {
                pagu: { increment: total },
                operasi: { increment: operasi },
                modal: { increment: modal },
                takTerduga: { increment: takTerduga },
                transfer: { increment: transfer }
              }
            })
          }
        })
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
  getRencanaPenarikan: protectedProcedure
    .input(z.object({ dpaId: z.string() }))
    .query(async ({ ctx, input }) => {
      const { dpaId } = input
      const result = await ctx.db.anggaranDPARencanaPenarikan.findMany({
        where: { dpaId },
        orderBy: [{ bulan: 'asc' }]
      })

      return result.map(obj => {
        const date = new Date(0, obj.bulan - 1); // Months are 0-indexed in JavaScript dates
        return { ...obj, monthName: date.toLocaleString('en-US', { month: 'short' }) };
      });
    }),
  setRencanaPenarikan: protectedProcedure
    .input(z.object({
      id: z.string(),
      total: z.object({
        operasi: z.object({
          teralokasi: z.number(),
          sisa: z.number()
        }),
        modal: z.object({
          teralokasi: z.number(),
          sisa: z.number()
        }),
        takTerduga: z.object({
          teralokasi: z.number(),
          sisa: z.number()
        }),
        transfer: z.object({
          teralokasi: z.number(),
          sisa: z.number()
        }),
      }),
      rencana: z.array(
        z.object({
          id: z.string(),
          operasi: z.number(),
          modal: z.number(),
          takTerduga: z.number(),
          transfer: z.number(),
          total: z.number()
        })
      )
    }))
    .mutation(async ({ ctx, input }) => {

      const {
        id,
        total: { modal, operasi, takTerduga, transfer },
        rencana
      } = input

      try {
        await ctx.db.$transaction(async (v) => {
          await v.anggaranDPA.update({
            where: { id },
            data: {
              oteralokasi: operasi.teralokasi,
              osisaAlokasi: operasi.sisa,
              mteralokasi: modal.teralokasi,
              msisaAlokasi: modal.sisa,
              ttteralokasi: takTerduga.teralokasi,
              ttsisaAlokasi: takTerduga.sisa,
              tteralokasi: transfer.teralokasi,
              tsisaAlokasi: transfer.sisa
            }
          })

          for (const val of rencana) {
            await v.anggaranDPARencanaPenarikan.update({
              where: { id: val.id },
              data: {
                operasi: val.operasi,
                modal: val.modal,
                takTerduga: val.takTerduga,
                transfer: val.transfer,
                total: val.total
              }
            })
          }
        })
        return {
          ok: true,
          message: 'berhasil'
        }
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "An unexpected error occurred, please try again later.",
          cause: error,
        });
      }
    }),
  getPengguna: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const { id } = input
      const result = await ctx.db.anggaranDPAPengguna.findMany({ where: { dpaId: id } })
      return result.map((v) => ({
        id: v.id,
        nama: v.nama,
        nip: v.nip,
        jabatan: v.jabatan,
        dpaId: v.dpaId,
        action: 'action'

      }))
    }),
  addPengguna: protectedProcedure
    .input(z.object({ nama: z.string(), nip: z.string(), jabatan: z.string(), dpaId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { nama, nip, jabatan, dpaId } = input
      try {
        await ctx.db.anggaranDPAPengguna.create({ data: { nama, nip, jabatan, dpaId } })
        return {
          ok: true,
          message: "Berhasil menambah dinas"
        }
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "An unexpected error occurred, please try again later.",
          cause: error,
        });
      }
    }),
  updatePengguna: protectedProcedure
    .input(z.object({ id: z.string(), nama: z.string(), nip: z.string(), jabatan: z.string(), dpaId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { id, nama, nip, jabatan, dpaId } = input
      try {
        await ctx.db.anggaranDPAPengguna.update({ where: { id }, data: { nama, nip, jabatan, dpaId } })
        return {
          ok: true,
          message: "Berhasil mengubah dinas"
        }
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "An unexpected error occurred, please try again later.",
          cause: error,
        });
      }
    }),
  deletePenggunaAnggaran: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { id } = input
      try {
        await ctx.db.anggaranDPAPengguna.delete({ where: { id } })

        return {
          ok: true,
          message: 'Berhasil hapus pengguna'
        }
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "An unexpected error occurred, please try again later.",
          cause: error,
        });
      }
    }),
  getTtd: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const { id } = input
      const result = await ctx.db.anggaranDPATtd.findMany({ where: { dpaId: id } })
      return result.map((v) => ({
        id: v.id,
        nama: v.nama,
        nip: v.nip,
        jabatan: v.jabatan,
        dpaId: v.dpaId,
        action: 'action'

      }))
    }),
  addTTd: protectedProcedure
    .input(z.object({ nama: z.string(), nip: z.string(), jabatan: z.string(), dpaId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { nama, nip, jabatan, dpaId } = input
      try {
        await ctx.db.anggaranDPATtd.create({ data: { nama, nip, jabatan, dpaId } })
        return {
          ok: true,
          message: "Berhasil menambah dinas"
        }
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "An unexpected error occurred, please try again later.",
          cause: error,
        });
      }
    }),
  updateTtd: protectedProcedure
    .input(z.object({ id: z.string(), nama: z.string(), nip: z.string(), jabatan: z.string(), dpaId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { id, nama, nip, jabatan, dpaId } = input
      try {
        await ctx.db.anggaranDPATtd.update({ where: { id }, data: { nama, nip, jabatan, dpaId } })
        return {
          ok: true,
          message: "Berhasil mengubah dinas"
        }
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "An unexpected error occurred, please try again later.",
          cause: error,
        });
      }
    }),
  deleteTtd: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { id } = input
      try {
        await ctx.db.anggaranDPATtd.delete({ where: { id } })

        return {
          ok: true,
          message: 'Berhasil hapus pengguna'
        }
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "An unexpected error occurred, please try again later.",
          cause: error,
        });
      }
    }),
  add: protectedProcedure
    .input(z.object({
      name: z.string()
    }))
    .mutation(async ({ ctx, input }) => {
      const { name } = input
      try {
        await ctx.db.dinas.create({ data: { name } })
        return {
          ok: true,
          message: "Berhasil menambah dinas"
        }
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "An unexpected error occurred, please try again later.",
          cause: error,
        });
      }

    }),
  update: protectedProcedure
    .input(z.object({ id: z.string(), name: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { name, id } = input
      try {
        await ctx.db.dinas.update({ data: { name }, where: { id } })

        return {
          ok: true,
          message: "Berhasil mengubah dinas"
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
        await ctx.db.dinas.delete({ where: { id } })
        return {
          ok: true,
          message: "Berhasil menghapus dinas"
        }
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "An unexpected error occurred, please try again later.",
          cause: error,
        });
      }

    }),
  getAllData: protectedProcedure
    .query(async ({ ctx }) => {
      const urusan = await ctx.db.urusan.findMany()
      const bidang = await ctx.db.bidang.findMany()
      const program = await ctx.db.program.findMany()
      const kegiatan = await ctx.db.kegiatan.findMany()
      const organisasi = await ctx.db.organisasi.findMany()
      const unit = await ctx.db.unit.findMany()

      return {
        urusan,
        bidang,
        program,
        kegiatan,
        organisasi,
        unit
      }
    }),
  getanggaran: protectedProcedure
    .input(z.object({ selectedDinas: z.string().optional(), selectedMonth: z.string().optional(), selectedYear: z.string().optional() }))
    .query(async ({ ctx, input }) => {
      const isAdmin = ctx.session.user.role
     
      const { selectedDinas, selectedMonth, selectedYear } = input

      const dinasId = selectedDinas || "";
      const getmonth = selectedMonth || "";
      const getyear = selectedYear || "";

      const month = parseInt(getmonth);
      const year = parseInt(getyear);

      let whereCondition: any = {};

      if (isAdmin !== 'admin') {
        whereCondition = {
          dinasId: ctx.session.user.dinas.id
        };
      }

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

      const result = await ctx.db.anggaranDPA.findMany({
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

      const OperasiJumlahAlokasi = result.reduce((total, anggaran) => total + (anggaran.operasi ?? 0), 0);
      const OperasiTeralokasi = result.reduce((total, anggaran) => total + (anggaran.oteralokasi ?? 0), 0);
      const Operasipersen = Math.round(OperasiTeralokasi / OperasiJumlahAlokasi * 100);

      const ModalAlokasi = result.reduce((total, anggaran) => total + (anggaran.modal ?? 0), 0);
      const ModalTeralokasi = result.reduce((total, anggaran) => total + (anggaran.mteralokasi ?? 0), 0);
      const Modalpersen = Math.round(ModalTeralokasi / ModalAlokasi * 100);

      const ttAlokasi = result.reduce((total, anggaran) => total + (anggaran.takTerduga ?? 0), 0);
      const ttTeralokasi = result.reduce((total, anggaran) => total + (anggaran.ttteralokasi ?? 0), 0);
      const ttpersen = Math.round(ttTeralokasi / ttAlokasi * 100);

      const transferAlokasi = result.reduce((total, anggaran) => total + (anggaran.transfer ?? 0), 0);
      const transferTeralokasi = result.reduce((total, anggaran) => total + (anggaran.tteralokasi ?? 0), 0);
      const transferpersen = Math.round(transferTeralokasi / transferAlokasi * 100);

      const dinas = await ctx.db.dinas.findMany()

      console.log("ibabbbb", result)
      return {
        anggaran: result,
        dinas: dinas.map((v) => ({ label: v.name, value: v.id })),
        totalJumlahAlokasi,
        totalTeralokasi,
        totalpersen,
        OperasiJumlahAlokasi,
        OperasiTeralokasi,
        Operasipersen,
        ModalAlokasi,
        ModalTeralokasi,
        Modalpersen,
        ttAlokasi,
        ttTeralokasi,
        ttpersen,
        transferAlokasi,
        transferTeralokasi,
        transferpersen
      }
    }),
});
