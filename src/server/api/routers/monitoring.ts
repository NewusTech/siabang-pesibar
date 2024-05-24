import { TRPCError } from "@trpc/server";
import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
} from "~/server/api/trpc";

export const monitoringRouter = createTRPCRouter({
  get: protectedProcedure
    .query(async ({ ctx }) => {
      const result = await ctx.db.pembangunanMonitoring.findMany({
        orderBy: [{ createdAt: 'desc' }],
        include: {
          Dinas: true,
        }
      })

      return result.map((v) => ({
        ...v,
        instansi: v.Dinas.name,
      }))
    }),
  getUmumById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {

      const { id } = input
      const res = await ctx.db.pembangunanMonitoring.findFirst({
        where: { id },
      })
      if (res) {

        const {
          namaPekerjaan,
          pelaksanaKontrak,
          nilaiKontrak,
          noKontrak,
          jenisPengadaan,
          mekanismePengadaan,
          swakelola,
          tanggalKontrak,
          tanggalMulai,
          tanggalSelesai,
          ppk,
          lokasi,
          kendala,
          tenagaKerja,
          penerapanK3,
          keterangan,
          realisasi
        } = res
        return {
          namaPekerjaan,
          pelaksanaKontrak,
          nilaiKontrak,
          noKontrak,
          jenisPengadaan,
          mekanismePengadaan,
          swakelola,
          tanggalKontrak,
          tanggalMulai,
          tanggalSelesai,
          ppk,
          lokasi,
          kendala,
          tenagaKerja: tenagaKerja?.toString(),
          penerapanK3,
          keterangan,
          realisasi
        }
      }
    }),
  getInformasiById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {

      const { id } = input
      const res = await ctx.db.pembangunanMonitoring.findFirst({
        where: { id },
      })
      if (res) {

        const {
          isAsuransi,
          isRencanaKecelakaan,
          isP3k,
          isRambu,
          tukangAsal,
          isTukangSkt,
          jumlahPekerja,
          jumlahPekerjaPesibar,
          jumlahPekerjaLuarPesibar,
          materialPesibar,
          materialLuarPesibar,
        } = res
        return {
          isAsuransi: isAsuransi?.toString(),
          isRencanaKecelakaan: isRencanaKecelakaan?.toString(),
          isP3k: isP3k?.toString(),
          isRambu: isRambu?.toString(),
          tukangAsal,
          isTukangSkt: isTukangSkt?.toString(),
          jumlahPekerja: jumlahPekerja?.toString(),
          jumlahPekerjaPesibar: jumlahPekerjaPesibar?.toString(),
          jumlahPekerjaLuarPesibar: jumlahPekerjaLuarPesibar?.toString(),
          materialPesibar: materialPesibar?.toString(),
          materialLuarPesibar: materialLuarPesibar?.toString(),
        }
      }
    }),
  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const { id } = input
      const res = await ctx.db.pembangunanMonitoring.findFirst({
        where: { id },
      })
      return res
    }),
  add: protectedProcedure
    .input(z.object({
      dinas: z.string(),
      namaPekerjaan: z.string(),
      pelaksanaKontrak: z.string(),
      subKegiatanId: z.string(),
      nilaiKontrak: z.number()
    }))
    .mutation(async ({ ctx, input }) => {
      const { dinas, namaPekerjaan, pelaksanaKontrak, subKegiatanId, nilaiKontrak } = input
      try {
        await ctx.db.pembangunanMonitoring.create({
          data: {
            dinasId: dinas,
            namaPekerjaan,
            pelaksanaKontrak,
            subKegiatanId,
            nilaiKontrak,
            tahun: new Date().getFullYear()
          }
        })
        return {
          ok: true,
          message: "Berhasil"
        }
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "An unexpected error occurred, please try again later.",
          cause: error,
        });
      }
    }),
  setUmum: protectedProcedure
    .input(z.object({
      id: z.string(),
      namaPekerjaan: z.string(),
      pelaksanaKontrak: z.string(),
      nilaiKontrak: z.number(),
      noKontrak: z.string(),
      jenisPengadaan: z.string(),
      mekanismePengadaan: z.string(),
      swakelola: z.string(),
      tanggalKontrak: z.date(),
      tanggalMulai: z.date(),
      tanggalSelesai: z.date(),
      ppk: z.string(),
      lokasi: z.string(),
      kendala: z.string(),
      tenagaKerja: z.string(),
      penerapanK3: z.string(),
      keterangan: z.string(),
      realisasi: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      const {
        id,
        namaPekerjaan,
        pelaksanaKontrak,
        nilaiKontrak,
        noKontrak,
        jenisPengadaan,
        mekanismePengadaan,
        swakelola,
        tanggalKontrak,
        tanggalMulai,
        tanggalSelesai,
        ppk,
        lokasi,
        kendala,
        tenagaKerja,
        penerapanK3,
        keterangan,
        realisasi
      } = input
      try {
        await ctx.db.pembangunanMonitoring.update({
          where: { id },
          data: {
            namaPekerjaan,
            pelaksanaKontrak,
            nilaiKontrak,
            noKontrak,
            jenisPengadaan,
            mekanismePengadaan,
            swakelola,
            tanggalKontrak,
            tanggalMulai,
            tanggalSelesai,
            ppk,
            lokasi,
            kendala,
            tenagaKerja: Number(tenagaKerja),
            penerapanK3,
            keterangan,
            realisasi
          }
        })

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
  setInformasi: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        isAsuransi: z.string(),
        isRencanaKecelakaan: z.string(),
        isP3k: z.string(),
        isRambu: z.string(),
        tukangAsal: z.string(),
        isTukangSkt: z.string(),
        jumlahPekerja: z.string(),
        jumlahPekerjaPesibar: z.string(),
        jumlahPekerjaLuarPesibar: z.string(),
        materialPesibar: z.string(),
        materialLuarPesibar: z.string(),
      }))
    .mutation(async ({ ctx, input }) => {
      const {
        id,
        isAsuransi,
        isRencanaKecelakaan,
        isP3k,
        isRambu,
        tukangAsal,
        isTukangSkt,
        jumlahPekerja,
        jumlahPekerjaPesibar,
        jumlahPekerjaLuarPesibar,
        materialPesibar,
        materialLuarPesibar,
      } = input
      try {
        await ctx.db.pembangunanMonitoring.update({
          where: { id },
          data: {
            isAsuransi: Number(isAsuransi),
            isRencanaKecelakaan: Number(isRencanaKecelakaan),
            isP3k: Number(isP3k),
            isRambu: Number(isRambu),
            tukangAsal,
            isTukangSkt: Number(isTukangSkt),
            jumlahPekerja: Number(jumlahPekerja),
            jumlahPekerjaPesibar: Number(jumlahPekerjaPesibar),
            jumlahPekerjaLuarPesibar: Number(jumlahPekerjaLuarPesibar),
            materialPesibar,
            materialLuarPesibar,
          }
        })

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
  getGallery: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const { id } = input
      const result = await ctx.db.pembangunanMonitoringDokumentasi.findMany({ where: { monitoringId: id }, orderBy: [{ createdAt: 'desc' }] })

      return result
    }),
  deleteGalleries: protectedProcedure
    .input(z.object({ ids: z.array(z.string()) }))
    .mutation(async ({ ctx, input }) => {
      const { ids } = input
      try {
        for (const iterator of ids) {
          const result = await ctx.db.$transaction(async (v) => {
            await v.pembangunanMonitoringDokumentasi.delete({
              where: { id: iterator }
            })
          })
          console.log("result", result)
        }
        return {
          ok: true,
          message: 'Berhasil menghapus gambar'
        }
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "An unexpected error occurred, please try again later.",
          cause: error,
        });
      }
    }),
  addBlankoKategori: protectedProcedure
    .input(z.object({ nama: z.string(), monitoringId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { nama, monitoringId } = input
      try {
        await ctx.db.pembangunanMonitoringBlankoKategori.create({
          data: {
            nama,
            total: 0,
            monitoringId
          }
        })
        return {
          ok: true
        }
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "An unexpected error occurred, please try again later.",
          cause: error,
        });
      }
    }),
  addBlanko: protectedProcedure
    .input(z.object({
      id: z.string(),
      kategoriId: z.string(),
      pekerjaan: z.string(),
      volume: z.number(),
      satuan: z.string(),
      harga: z.number(),
      monitoringId: z.string(),
      type: z.string()
    }))
    .mutation(async ({ ctx, input }) => {
      const {
        id,
        harga,
        kategoriId,
        monitoringId,
        pekerjaan,
        satuan,
        type,
        volume
      } = input
      if (type === 'add') {
        await ctx.db.pembangunanMonitoringBlanko.create({
          data: {
            harga,
            kategoriId,
            monitoringId,
            pekerjaan,
            satuan,
            total: volume * harga,
            volume
          }
        })
      } else {
        await ctx.db.pembangunanMonitoringBlanko.update({
          where: { id },
          data: {
            harga,
            kategoriId,
            monitoringId,
            pekerjaan,
            satuan,
            total: volume * harga,
            volume
          }
        })
      }
      return {
        ok: true
      }
    })
  ,
  getBlanko: protectedProcedure
    .input(z.object({ monitoringId: z.string() }))
    .query(async ({ ctx, input }) => {
      const { monitoringId } = input
      const kategori = await ctx.db.pembangunanMonitoringBlankoKategori.findMany({ where: { monitoringId }, orderBy: { createdAt: "asc" } })
      const blanko = await ctx.db.pembangunanMonitoringBlanko.findMany({
        where: { monitoringId },
        orderBy: { createdAt: 'asc' }
      })

      const data = mergeBlanko(kategori, blanko)

      return data
    }),
  deleteBlanko: protectedProcedure
    .input(z.object({ id: z.string(), type: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { id, type } = input

      if (type === 'sub') {
        await ctx.db.pembangunanMonitoringBlanko.delete({ where: { id } })
        return {
          ok: 'Berhasil hapus'
        }
      }

      await ctx.db.$transaction([
        ctx.db.pembangunanMonitoringBlanko.deleteMany({ where: { kategoriId: id } }),
        ctx.db.pembangunanMonitoringBlankoKategori.delete({ where: { id } })
      ])

      return {
        ok: "Berhasil Hapus"
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

function mergeBlanko(kategori: any[], sub: any[]) {
  const result: any[] = [];
  let emptyCounter = 1;

  kategori.forEach((kat, i) => {
    result.push({ type: 'cat', no: toRoman(i + 1), id: kat.id, name: kat.nama, vol: '', satuan: '', harga: '', total: kat.total });

    sub.filter(s => s.kategoriId === kat.id).forEach((s, x) => {
      result.push({
        type: 'sub',
        no: x + 1,
        id: s.id,
        name: s.pekerjaan,
        vol: s.volume,
        satuan: s.satuan,
        harga: s.harga,
        total: s.total,
        kategoriId: s.kategoriId
      });
    });

    result.push({ type: 'empty', id: `empty-${emptyCounter++}`, kategoriId: kat.id });
  });

  if (result[result.length - 1].name === '') {
    result.pop();
  }

  return result;
}

function toRoman(num: number) {
  const lookup: any = { M: 1000, CM: 900, D: 500, CD: 400, C: 100, XC: 90, L: 50, XL: 40, X: 10, IX: 9, V: 5, IV: 4, I: 1 };
  let roman = '';
  for (let i in lookup) {
    while (num >= lookup[i]) {
      roman += i;
      num -= lookup[i];
    }
  }
  return roman;
}