import { zodResolver } from "@hookform/resolvers/zod"
import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import DatePicker from "~/components/DatePicker"
import MoneyInput from "~/components/MoneyInput"
import SearchSelect from "~/components/SearchSelect"
import { Button } from "~/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form"
import { Input } from "~/components/ui/input"
import { api } from "~/utils/api"
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {Textarea} from "~/components/ui/textarea";

const formSchema = z.object({
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
  realisasi: z.string()
})

const swakelola = [
  { value: 'Ya', label: 'Ya' },
  { value: 'Tidak', label: 'Tidak' },
];

const mekanismePengadaan = [
  { label: 'E-Purchasing', value: 'E-Purchasing' },
  { label: 'Pengadaan langsung', value: 'Pengadaan langsung' },
  { label: 'Tender (lelang)', value: 'Tender (lelang)' }
];

const jenisPengadaan = [
  { label: 'Pengadaan barang', value: 'Pengadaan barang' },
  { label: 'Konsultasi perencanaan', value: 'Konsultasi perencanaan' },
  { label: 'Konsultasi pengawasan', value: 'Konsultasi pengawasan' },
  { label: 'Konstruksi', value: 'Konstruksi' },
  { label: 'Pengadaan jasa lainnya', value: 'Pengadaan jasa lainnya' },
  { label: 'Konsultasi non konstruksi', value: 'Konsultasi non konstruksi' }
];

const DataUmum = ({ id }: { id: string }) => {
  const { data } = api.monitoring.getUmumById.useQuery({ id })
  const [successMessage, setSuccessMessage] = useState<string>("");
  const { mutateAsync, isLoading } = api.monitoring.setUmum.useMutation()
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      id,
      namaPekerjaan: '',
      pelaksanaKontrak: '',
      nilaiKontrak: undefined,
      noKontrak: '',
      jenisPengadaan: '',
      mekanismePengadaan: '',
      swakelola: '',
      tanggalKontrak: undefined,
      tanggalMulai: undefined,
      tanggalSelesai: undefined,
      ppk: '',
      lokasi: '',
      kendala: '',
      tenagaKerja: "",
      penerapanK3: '',
      keterangan: '',
      realisasi: ''
    },
  })

  useEffect(() => {
    if (data) {
      Object.keys(data).forEach((key) => {
        // @ts-ignore
        const value = data[key];
        if (value) {
          // @ts-ignore
          form.setValue(key, value);
        }
      });
    }

  }, [data, form])

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      await mutateAsync(values)
      console.log(values)
      setSuccessMessage("Input berhasil disimpan!");
      setTimeout(() => {
        setSuccessMessage("");
      }, 3000);
    } catch (error) {
      console.log("error", error)

    }
  }

  const handlePrint = () => {
    if (!data) return; // Handle case where data hasn't been fetched yet

    const formatDate = (date: Date): string => {
      const options: Intl.DateTimeFormatOptions = {
        day: "2-digit",
        month: "long",
        year: "numeric",
      };

      return new Intl.DateTimeFormat("id-ID", options).format(date);
    };

    const calculateDateDifference = (
      startDate: Date,
      endDate: Date,
    ): number => {
      const differenceInTime = endDate.getTime() - startDate.getTime();

      const differenceInDays = Math.ceil(differenceInTime / (1000 * 3600 * 24));

      return differenceInDays;
    };

    const formatCurrency = (value: number): string => {
      return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(value);
    };

    const doc = new jsPDF();
    // Header kolom

    // Buat tabel dengan menggunakan autoTable
    // @ts-ignore
    autoTable(doc, {
      startY: 20,
      head: [
        // Header dengan satu baris dan dua sel
        [
          {
            content: "DATA UMUM",
            colSpan: 2,
            styles: {
              halign: "center",
              fillColor: "#fff",
              textColor: [0, 0, 0],
              lineWidth: 0.1,
              lineColor: [0, 0, 0],
            },
          }, // Sel kedua yang mencakup kolom kedua dan ketiga
        ],
      ],
      body: [
        [
          {
            content: "Nama Pekerjaan",
            styles: {
              halign: "left",
              fillColor: "#fff",
              textColor: [0, 0, 0],
              fontSize: 8,
              fontStyle: "bold",
              lineWidth: 0.1,
              lineColor: [0, 0, 0],
            },
          },
          {
            content: data.namaPekerjaan,
            styles: {
              halign: "left",
              fillColor: "#fff",
              textColor: [0, 0, 0],
              fontSize: 8,
              lineWidth: 0.1,
              lineColor: [0, 0, 0],
            },
          },
        ],
        [
          // Sel pertama
          {
            content: "Kontraktor Pelaksana",
            styles: {
              halign: "left",
              fillColor: "#fff",
              textColor: [0, 0, 0],
              fontSize: 8,
              fontStyle: "bold",
              lineWidth: 0.1,
              lineColor: [0, 0, 0],
            },
          },
          {
            content: data.pelaksanaKontrak,
            styles: {
              halign: "left",
              fillColor: "#fff",
              textColor: [0, 0, 0],
              fontSize: 8,
              lineWidth: 0.1,
              lineColor: [0, 0, 0],
            },
          },
        ],
        [
          // Sel pertama
          {
            content: "Nomor Kontrak",
            styles: {
              halign: "left",
              fillColor: "#fff",
              textColor: [0, 0, 0],
              fontSize: 8,
              fontStyle: "bold",
              lineWidth: 0.1,
              lineColor: [0, 0, 0],
            },
          },
          {
            content: data?.noKontrak ?? "",
            styles: {
              halign: "left",
              fillColor: "#fff",
              textColor: [0, 0, 0],
              fontSize: 8,
              lineWidth: 0.1,
              lineColor: [0, 0, 0],
            },
          },
        ],
        [
          // Sel pertama
          {
            content: "Tanggal Kontrak",
            styles: {
              halign: "left",
              fillColor: "#fff",
              textColor: [0, 0, 0],
              fontSize: 8,
              fontStyle: "bold",
              lineWidth: 0.1,
              lineColor: [0, 0, 0],
            },
          },
          {
            content: `${data.tanggalKontrak && formatDate(data.tanggalKontrak)}`,
            styles: {
              halign: "left",
              fillColor: "#fff",
              textColor: [0, 0, 0],
              fontSize: 8,
              lineWidth: 0.1,
              lineColor: [0, 0, 0],
            },
          },
        ],
        [
          // Sel pertama
          {
            content: "Nilai Kontrak",
            styles: {
              halign: "left",
              fillColor: "#fff",
              textColor: [0, 0, 0],
              fontSize: 8,
              fontStyle: "bold",
              lineWidth: 0.1,
              lineColor: [0, 0, 0],
            },
          },
          {
            content: `${data.nilaiKontrak && formatCurrency(data.nilaiKontrak)}`,
            styles: {
              halign: "left",
              fillColor: "#fff",
              textColor: [0, 0, 0],
              fontSize: 8,
              lineWidth: 0.1,
              lineColor: [0, 0, 0],
            },
          },
        ],
        [
          // Sel pertama
          {
            content: "Lokasi",
            styles: {
              halign: "left",
              fillColor: "#fff",
              textColor: [0, 0, 0],
              fontSize: 8,
              fontStyle: "bold",
              lineWidth: 0.1,
              lineColor: [0, 0, 0],
            },
          },
          {
            content: data?.lokasi ?? "",
            styles: {
              halign: "left",
              fillColor: "#fff",
              textColor: [0, 0, 0],
              fontSize: 8,
              lineWidth: 0.1,
              lineColor: [0, 0, 0],
            },
          },
        ],
        [
          // Sel pertama
          {
            content: "Jangka Waktu",
            styles: {
              halign: "left",
              fillColor: "#fff",
              textColor: [0, 0, 0],
              fontSize: 8,
              fontStyle: "bold",
              lineWidth: 0.1,
              lineColor: [0, 0, 0],
            },
          },
          {
            content: `${data.tanggalMulai && data.tanggalSelesai && calculateDateDifference(data.tanggalMulai, data.tanggalSelesai)} hari`,
            styles: {
              halign: "left",
              fillColor: "#fff",
              textColor: [0, 0, 0],
              fontSize: 8,
              lineWidth: 0.1,
              lineColor: [0, 0, 0],
            },
          },
        ],
        [
          // Sel pertama
          {
            content: "Mulai Kerja",
            styles: {
              halign: "left",
              fillColor: "#fff",
              textColor: [0, 0, 0],
              fontSize: 8,
              fontStyle: "bold",
              lineWidth: 0.1,
              lineColor: [0, 0, 0],
            },
          },
          {
            content: `${data.tanggalMulai && formatDate(data.tanggalMulai)} s/d ${data.tanggalSelesai && formatDate(data.tanggalSelesai)}`,
            styles: {
              halign: "left",
              fillColor: "#fff",
              textColor: [0, 0, 0],
              fontSize: 8,
              lineWidth: 0.1,
              lineColor: [0, 0, 0],
            },
          },
        ],
        [
          // Sel pertama
          {
            content: "Realisasi Pelaksanaan",
            styles: {
              halign: "left",
              fillColor: "#fff",
              textColor: [0, 0, 0],
              fontSize: 8,
              fontStyle: "bold",
              lineWidth: 0.1,
              lineColor: [0, 0, 0],
            },
          },
          {
            content: data?.realisasi ?? "",
            styles: {
              halign: "left",
              fillColor: "#fff",
              textColor: [0, 0, 0],
              fontSize: 8,
              lineWidth: 0.1,
              lineColor: [0, 0, 0],
            },
          },
        ],
        [
          // Sel pertama
          {
            content: "Kendala/Hambatan",
            styles: {
              halign: "left",
              fillColor: "#fff",
              textColor: [0, 0, 0],
              fontSize: 8,
              fontStyle: "bold",
              lineWidth: 0.1,
              lineColor: [0, 0, 0],
            },
          },
          {
            content: data?.kendala ?? "",
            styles: {
              halign: "left",
              fillColor: "#fff",
              textColor: [0, 0, 0],
              fontSize: 8,
              lineWidth: 0.1,
              lineColor: [0, 0, 0],
            },
          },
        ],
        [
          // Sel pertama
          {
            content: "Tenaga Kerja",
            styles: {
              halign: "left",
              fillColor: "#fff",
              textColor: [0, 0, 0],
              fontSize: 8,
              fontStyle: "bold",
              lineWidth: 0.1,
              lineColor: [0, 0, 0],
            },
          },
          {
            content: data.tenagaKerja,
            styles: {
              halign: "left",
              fillColor: "#fff",
              textColor: [0, 0, 0],
              fontSize: 8,
              lineWidth: 0.1,
              lineColor: [0, 0, 0],
            },
          },
        ],
        [
          // Sel pertama
          {
            content: "Penerapan K3",
            styles: {
              halign: "left",
              fillColor: "#fff",
              textColor: [0, 0, 0],
              fontSize: 8,
              fontStyle: "bold",
              lineWidth: 0.1,
              lineColor: [0, 0, 0],
            },
          },
          {
            content: data?.penerapanK3 ?? "",
            styles: {
              halign: "left",
              fillColor: "#fff",
              textColor: [0, 0, 0],
              fontSize: 8,
              lineWidth: 0.1,
              lineColor: [0, 0, 0],
            },
          },
        ],
        [
          // Sel pertama
          {
            content: "Catatan",
            styles: {
              halign: "left",
              fillColor: "#fff",
              textColor: [0, 0, 0],
              fontSize: 8,
              fontStyle: "bold",
              lineWidth: 0.1,
              lineColor: [0, 0, 0],
            },
          },
          {
            content: data?.keterangan ?? "",
            styles: {
              halign: "left",
              fillColor: "#fff",
              textColor: [0, 0, 0],
              fontSize: 8,
              lineWidth: 0.1,
              lineColor: [0, 0, 0],
            },
          },
        ],
      ],
    });
    doc.save("Data Umum.pdf");
  };

  return (
    <div className="border rounded-md p-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="namaPekerjaan"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nama Pekerjaan</FormLabel>
                <FormControl>
                  <Input placeholder="Nama Pekerjaan" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="pelaksanaKontrak"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Pelaksana</FormLabel>
                <FormControl>
                  <Input placeholder="Pelaksana" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="grid grid-cols-2 gap-4">
            <MoneyInput
              className="flex-1"
              form={form}
              label="Nilai Kontrak"
              name="nilaiKontrak"
              placeholder="Rp 0"
            />
            <FormField
              control={form.control}
              name="noKontrak"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nomor Kontrak</FormLabel>
                  <FormControl>
                    <Input placeholder="Nomor Kontrak" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <SearchSelect
              data={jenisPengadaan}
              form={form}
              label="Jenis Pengadaan"
              name="jenisPengadaan"
              placeholder="Jenis Pengadaan"
            />
            <SearchSelect
              data={mekanismePengadaan}
              form={form}
              label="Mekanisme Pengadaan"
              name="mekanismePengadaan"
              placeholder="Mekanisme Pengadaan"
            />
            <SearchSelect
              data={swakelola}
              form={form}
              label="Swakelola"
              name="swakelola"
              placeholder="Swakelola"
            />
          </div>
          <div className="grid grid-cols-4 gap-4">
            <DatePicker form={form} name="tanggalKontrak" label="Tanggal Kontrak" />
            <DatePicker form={form} name="tanggalMulai" label="Jadwal Pelaksanaan" />
            <DatePicker form={form} name="tanggalSelesai" label="Tanggal Selesai" />
            <FormField
              control={form.control}
              name="realisasi"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Realisasi Pelaksanaan</FormLabel>
                  <FormControl>
                    <Input placeholder="Realisasi Pelaksanaan" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <FormField
            control={form.control}
            name="ppk"
            render={({ field }) => (
              <FormItem>
                <FormLabel>PPK</FormLabel>
                <FormControl>
                  <Input placeholder="PPK" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="grid grid-cols-4 gap-4">
            <FormField
              control={form.control}
              name="lokasi"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Lokasi</FormLabel>
                  <FormControl>
                    <Input placeholder="Masukan Lokasi" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="kendala"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Kendala</FormLabel>
                  <FormControl>
                    <Input placeholder="Kendala" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="tenagaKerja"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tenaga</FormLabel>
                  <FormControl>
                    <Input placeholder="Tenaga Kerja" type="number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="penerapanK3"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Penerapan K3</FormLabel>
                  <FormControl>
                    <Input placeholder="Penerapan K3" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <FormField
            control={form.control}
            name="keterangan"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Keterangan</FormLabel>
                <FormControl>
                  <Textarea placeholder="Keterangan" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {successMessage && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 mt-4 rounded-md">
              {successMessage}
            </div>
          )}
          <div className="flex justify-end gap-2">
            <Button type="submit" disabled={isLoading}>{isLoading ? 'Loading...' : 'Simpan'}</Button>
            <Button type="button" onClick={handlePrint}>
              Print
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )

}

export default DataUmum