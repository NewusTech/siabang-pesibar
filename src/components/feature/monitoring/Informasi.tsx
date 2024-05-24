import { zodResolver } from "@hookform/resolvers/zod"
import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
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
import { RadioGroup, RadioGroupItem } from "~/components/ui/radio-group"
import { Separator } from "~/components/ui/separator"
import { api } from "~/utils/api"
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const formSchema = z.object({
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
})

const asuransi = [
  { value: '1', label: "Ya" },
  { value: '2', label: "Tidak" },
  { value: '3', label: "Sebagian" },
]

const rencana = [
  { value: '1', label: "Ya" },
  { value: '2', label: "Tidak" },
]

const p3k = [
  { value: '1', label: "Ya" },
  { value: '2', label: "Tidak" },
]

const rambu = [
  { value: '1', label: "Ya" },
  { value: '2', label: "Tidak" },
]

const Informasi = ({ id }: { id: string }) => {
  const { data } = api.monitoring.getInformasiById.useQuery({ id })
  const { mutateAsync, isLoading } = api.monitoring.setInformasi.useMutation()
  const [successMessage, setSuccessMessage] = useState<string>("");
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      id,
      isAsuransi: "",
      isRencanaKecelakaan: "",
      isP3k: "",
      isRambu: "",
      tukangAsal: '',
      isTukangSkt: "",
      jumlahPekerja: "",
      jumlahPekerjaPesibar: "",
      jumlahPekerjaLuarPesibar: "",
      materialPesibar: '',
      materialLuarPesibar: '',
    },
  })

  console.log(data)

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
      setSuccessMessage("Input berhasil disimpan!");
      setTimeout(() => {
        setSuccessMessage("");
      }, 3000);
    } catch (error) {
      console.log("error", error)
    }
  }
  console.log("form", form.watch("isAsuransi"))

  const handlePrint = () => {
    if (!data) return; // Handle case where data hasn't been fetched yet

    const doc = new jsPDF();
    // Header kolom

    // Buat tabel dengan menggunakan autoTable
    autoTable(doc, {
      startY: 20,
      head: [
        // Header dengan satu baris dan dua sel
        [
          {
            content: "Informasi Pembangunan",
            colSpan: 2,
            styles: {
              halign: "center",
              fillColor: "#fff",
              textColor: [0, 0, 0],
              fontSize: 16,
              lineWidth: 0.1,
              lineColor: [0, 0, 0],
            },
          },
        ],
      ],
      body: [
        [
          {
            content: "Keselamatan pekerja konstruksi",
            colSpan: 2,
            styles: {
              halign: "left",
              fillColor: "#fff",
              textColor: [0, 0, 0],
              fontSize: 12,
              fontStyle: "bold",
              lineWidth: 0.1,
              lineColor: [0, 0, 0],
            },
          }, // Sel pertama
        ],
        [
          {
            content: "Semua Pekerja dilindungi dengan asuransi kesehatan",
            styles: {
              halign: "left",
              fillColor: "#fff",
              textColor: [0, 0, 0],
              fontSize: 10,
              lineWidth: 0.1,
              lineColor: [0, 0, 0],
            },
          },
          {
            content: data.isAsuransi === "1" ? "Ya" : data.isAsuransi === "2" ? "Tidak" : "Sebagian",
            styles: {
              halign: "left",
              fillColor: "#fff",
              textColor: [0, 0, 0],
              fontSize: 10,
              lineWidth: 0.1,
              lineColor: [0, 0, 0],
            },
          },
        ],
        [
          // Sel pertama
          {
            content: "Jika terjadi kecelakaan kerja sudah ada rencana?",
            styles: {
              halign: "left",
              fillColor: "#fff",
              textColor: [0, 0, 0],
              fontSize: 10,
              lineWidth: 0.1,
              lineColor: [0, 0, 0],
            },
          },
          {
            content: data.isRencanaKecelakaan === "1" ? "Ya" : "Tidak",
            styles: {
              halign: "left",
              fillColor: "#fff",
              textColor: [0, 0, 0],
              fontSize: 10,
              lineWidth: 0.1,
              lineColor: [0, 0, 0],
            },
          },
        ],
        [
          // Sel pertama
          {
            content: "Dilokasi kerja sudah ada kotak P3K",
            styles: {
              halign: "left",
              fillColor: "#fff",
              textColor: [0, 0, 0],
              fontSize: 10,
              lineWidth: 0.1,
              lineColor: [0, 0, 0],
            },
          },
          {
            content: data.isP3k === "1" ? "Ya" : "Tidak",
            styles: {
              halign: "left",
              fillColor: "#fff",
              textColor: [0, 0, 0],
              fontSize: 10,
              lineWidth: 0.1,
              lineColor: [0, 0, 0],
            },
          },
        ],
        [
          // Sel pertama
          {
            content: "Dilokasi kerja sudah ada rambu keselamatan petunjuk?",
            styles: {
              halign: "left",
              fillColor: "#fff",
              textColor: [0, 0, 0],
              fontSize: 10,
              lineWidth: 0.1,
              lineColor: [0, 0, 0],
            },
          },
          {
            content: data.isRambu === "1" ? "Ya" : "Tidak",
            styles: {
              halign: "left",
              fillColor: "#fff",
              textColor: [0, 0, 0],
              fontSize: 10,
              lineWidth: 0.1,
              lineColor: [0, 0, 0],
            },
          },
        ],
        [
          {
            content: "",
            colSpan: 2,
            styles: {
              halign: "left",
              fillColor: "#fff",
              textColor: [0, 0, 0],
              lineWidth: 0.1,
              lineColor: [0, 0, 0],
            },
          },
        ],// Sel pertama],
        [
          {
            content: "Kepala tukang",
            colSpan: 2,
            styles: {
              halign: "left",
              fillColor: "#fff",
              textColor: [0, 0, 0],
              fontSize: 12,
              fontStyle: "bold",
              lineWidth: 0.1,
              lineColor: [0, 0, 0],
            },
          }, // Sel pertama
        ],
        [
          // Sel pertama
          {
            content: "Berasal dari",
            styles: {
              halign: "left",
              fillColor: "#fff",
              textColor: [0, 0, 0],
              fontSize: 10,
              lineWidth: 0.1,
              lineColor: [0, 0, 0],
            },
          },
          {
            content: data?.tukangAsal ?? "",
            styles: {
              halign: "left",
              fillColor: "#fff",
              textColor: [0, 0, 0],
              fontSize: 10,
              lineWidth: 0.1,
              lineColor: [0, 0, 0],
            },
          },
        ],
        [
          // Sel pertama
          {
            content: "Punya SKT/SKK",
            styles: {
              halign: "left",
              fillColor: "#fff",
              textColor: [0, 0, 0],
              fontSize: 10,
              lineWidth: 0.1,
              lineColor: [0, 0, 0],
            },
          },
          {
            content: data.isTukangSkt === "1" ? "Ya" : "Tidak",
            styles: {
              halign: "left",
              fillColor: "#fff",
              textColor: [0, 0, 0],
              fontSize: 10,
              lineWidth: 0.1,
              lineColor: [0, 0, 0],
            },
          },
        ],
        [
          // Sel pertama
          {
            content: "",
            colSpan: 2,
            styles: {
              halign: "left",
              fillColor: "#fff",
              textColor: [0, 0, 0],
              lineWidth: 0.1,
              lineColor: [0, 0, 0],
            },
          },
        ],
        [
          // Sel pertama
          {
            content: "Pekerja",
            colSpan: 2,
            styles: {
              halign: "left",
              fillColor: "#fff",
              textColor: [0, 0, 0],
              fontSize: 12,
              fontStyle: "bold",
              lineWidth: 0.1,
              lineColor: [0, 0, 0],
            },
          },
        ],
        [
          // Sel pertama
          {
            content: "Jumlah pekerja",
            styles: {
              halign: "left",
              fillColor: "#fff",
              textColor: [0, 0, 0],
              fontSize: 10,
              lineWidth: 0.1,
              lineColor: [0, 0, 0],
            },
          },
          {
            content: data.jumlahPekerja,
            styles: {
              halign: "left",
              fillColor: "#fff",
              textColor: [0, 0, 0],
              fontSize: 10,
              lineWidth: 0.1,
              lineColor: [0, 0, 0],
            },
          },
        ],
        [
          // Sel pertama
          {
            content: "Jumlah pekerja dari pesibar",
            styles: {
              halign: "left",
              fillColor: "#fff",
              textColor: [0, 0, 0],
              fontSize: 10,
              lineWidth: 0.1,
              lineColor: [0, 0, 0],
            },
          },
          {
            content: data.jumlahPekerjaPesibar,
            styles: {
              halign: "left",
              fillColor: "#fff",
              textColor: [0, 0, 0],
              fontSize: 10,
              lineWidth: 0.1,
              lineColor: [0, 0, 0],
            },
          },
        ],
        [
          // Sel pertama
          {
            content: "Jumlah pekerja dari luar pesibar",
            styles: {
              halign: "left",
              fillColor: "#fff",
              textColor: [0, 0, 0],
              fontSize: 10,
              lineWidth: 0.1,
              lineColor: [0, 0, 0],
            },
          },
          {
            content: data.jumlahPekerjaLuarPesibar,
            styles: {
              halign: "left",
              fillColor: "#fff",
              textColor: [0, 0, 0],
              fontSize: 10,
              lineWidth: 0.1,
              lineColor: [0, 0, 0],
            },
          },
        ],
        [
          // Sel pertama
          {
            content: "",
            colSpan: 2,
            styles: {
              halign: "left",
              fillColor: "#fff",
              textColor: [0, 0, 0],
              lineWidth: 0.1,
              lineColor: [0, 0, 0],
            },
          },
        ],
        [
          // Sel pertama
          {
            content: "Asal Material",
            colSpan: 2,
            styles: {
              halign: "left",
              fillColor: "#fff",
              textColor: [0, 0, 0],
              fontSize: 12,
              fontStyle: "bold",
              lineWidth: 0.1,
              lineColor: [0, 0, 0],
            },
          },
        ],
        [
          // Sel pertama
          {
            content: "Pesibar",
            styles: {
              halign: "left",
              fillColor: "#fff",
              textColor: [0, 0, 0],
              fontSize: 10,
              lineWidth: 0.1,
              lineColor: [0, 0, 0],
            },
          },
          {
            content: data.materialPesibar,
            styles: {
              halign: "left",
              fillColor: "#fff",
              textColor: [0, 0, 0],
              fontSize: 10,
              lineWidth: 0.1,
              lineColor: [0, 0, 0],
            },
          },
        ],
        [
          // Sel pertama
          {
            content: "Luar pesibar",
            styles: {
              halign: "left",
              fillColor: "#fff",
              textColor: [0, 0, 0],
              fontSize: 10,
              lineWidth: 0.1,
              lineColor: [0, 0, 0],
            },
          },
          {
            content: data.materialLuarPesibar,
            styles: {
              halign: "left",
              fillColor: "#fff",
              textColor: [0, 0, 0],
              fontSize: 10,
              lineWidth: 0.1,
              lineColor: [0, 0, 0],
            },
          },
        ],
      ],
    });
    doc.save("Data Informasi Pembangunan.pdf");
  };

  return (
    <div className="border rounded-md p-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <p className="font-semibold">Keselamatan pekerja konstruksi</p>
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="isAsuransi"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Semua pekerja dilindungi dengan asuransi kesehatan</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      className=""
                      value={form.watch('isAsuransi')}
                    >
                      {asuransi.map((v) => (
                        <FormItem key={v.value} className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value={v.value} />
                          </FormControl>
                          <FormLabel className="font-normal">
                            {v.label}
                          </FormLabel>
                        </FormItem>
                      ))}
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="isRencanaKecelakaan"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Jika terjadi kecelakaan kerja sudah ada rencana?</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      value={form.watch('isRencanaKecelakaan')}
                      className=""
                    >
                      {rencana.map((v) => (
                        <FormItem key={v.value} className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value={v.value} />
                          </FormControl>
                          <FormLabel className="font-normal">
                            {v.label}
                          </FormLabel>
                        </FormItem>
                      ))}
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="isP3k"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Dilokasi kerja sudah ada kotak P3K</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      className=""
                      value={form.watch('isP3k')}
                    >
                      {p3k.map((v) => (
                        <FormItem key={v.value} className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value={v.value} />
                          </FormControl>
                          <FormLabel className="font-normal">
                            {v.label}
                          </FormLabel>
                        </FormItem>
                      ))}
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="isRambu"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Dilokasi kerja sudah ada rambu keselamatan petunjuk?</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      className=""
                      value={form.watch('isRambu')}
                    >
                      {rambu.map((v) => (
                        <FormItem key={v.value} className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value={v.value} />
                          </FormControl>
                          <FormLabel className="font-normal">
                            {v.label}
                          </FormLabel>
                        </FormItem>
                      ))}
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <Separator className="space-y-4" />
          <p className="font-semibold">Kepala tukang</p>
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="tukangAsal"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Berasal dari</FormLabel>
                  <FormControl>
                    <Input placeholder="Keterangan" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="isTukangSkt"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Punya SKT/SKK?</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      className=""
                      value={form.watch('isTukangSkt')}
                    >
                      {rambu.map((v) => (
                        <FormItem key={v.value} className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value={v.value} />
                          </FormControl>
                          <FormLabel className="font-normal">
                            {v.label}
                          </FormLabel>
                        </FormItem>
                      ))}
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <Separator className="space-y-4" />
          <p className="font-semibold">Pekerja</p>
          <div className="grid grid-cols-3 gap-4">
            <FormField
              control={form.control}
              name="jumlahPekerja"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Jumlah Pekerja</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="Jumlah Pekerja" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="jumlahPekerjaPesibar"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Jumlah Pekerja Dari Pesibar</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="Jumlah Pekerja dari pesibar" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="jumlahPekerjaLuarPesibar"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Jumlah pekerja dari luar pesibar</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="Jumlah pekerja dari luar pesibar" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <Separator className="space-y-4" />
          <p className="font-semibold">Asal Material</p>
          <div className="grid grid-cols-3 gap-4">
            <FormField
              control={form.control}
              name="materialPesibar"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Pesibar</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="Pesibar" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="materialLuarPesibar"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Luar Pesibar</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="Luar Pesibar" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
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

export default Informasi