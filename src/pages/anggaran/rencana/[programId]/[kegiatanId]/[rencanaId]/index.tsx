import { zodResolver } from "@hookform/resolvers/zod"
import { atom, useAtom } from "jotai"
import { useRouter } from "next/router"
import { Fragment, useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import Breadcrumbs from "~/components/BreadCrumbs"
import MoneyInput from "~/components/MoneyInput"
import { Layout } from "~/components/layout"
import { Button } from "~/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel } from "~/components/ui/form"
import { Input } from "~/components/ui/input"
import { Label } from "~/components/ui/label"
import { Separator } from "~/components/ui/separator"
import { Textarea } from "~/components/ui/textarea"
import { api } from "~/utils/api"

type Form = {
  id: string
  operasi: number
  modal: number
  takTerduga: number
  transfer: number
  keterangan: string
}

type ATOM = {
  pagu: number | null | undefined
  terealisasi: number | null | undefined
  presentasi: number
  operasi: number | null | undefined
  orealiasi: number | null | undefined
  osisa: number | null | undefined
  modal: number | null | undefined
  mrealisasi: number | null | undefined
  msisa: number | null | undefined
  takTerduga: number | null | undefined
  ttrealisasi: number | null | undefined
  ttsisa: number | null | undefined
  transfer: number | null | undefined
  trealisasi: number | null | undefined
  tsisa: number | null | undefined
  form: Form[] | undefined
}

const pengambilanAtom = atom<ATOM>({
  pagu: 0,
  terealisasi: 0,
  presentasi: 0,
  operasi: 0,
  orealiasi: 0,
  osisa: 0,
  modal: 0,
  mrealisasi: 0,
  msisa: 0,
  takTerduga: 0,
  ttrealisasi: 0,
  ttsisa: 0,
  transfer: 0,
  trealisasi: 0,
  tsisa: 0,
  form: []
})

const formSchema = z.object({
  id: z.string(),
  operasi: z.number(),
  modal: z.number(),
  takTerduga: z.number(),
  transfer: z.number(),
  keterangan: z.string()
})

const Page = () => {
  const router = useRouter()
  const id = router.query.rencanaId as string
  const { data, refetch } = api.realisasi.getRealisasi.useQuery({ id })
  const [show, setShow] = useState<number | undefined>(undefined)
  const { mutateAsync } = api.realisasi.setRealisasi.useMutation()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  })

  useEffect(() => {
    if (show !== undefined) {
      form.setValue('id', data!.form![show]!.id)
      form.setValue('id', data!.form![show]!.id)
      form.setValue('operasi', data!.form![show]!.operasi)
      form.setValue('modal', data!.form![show]!.modal)
      form.setValue('takTerduga', data!.form![show]!.takTerduga)
      form.setValue('transfer', data!.form![show]!.transfer)
      form.setValue('keterangan', data!.form![show]!.keterangan)
    }

  }, [show, form, data])

  const handleSubmit = async (values: z.infer<typeof formSchema>) => {

    try {
      await mutateAsync({ ...values, prevTerrealisasi: data!.terrealisasi as number })
      refetch()

    } catch (error) {
      console.log("err", error)

    }
  }


  return (
    <Layout>
      <div className="container mx-auto mt-12">
        <div className="mb-5 space-y-1">
          <Breadcrumbs data={[{ name: "informasi dpa" }]} />
          <p className="font-semibold">Informasi DPA</p>
        </div>
        <div className="my-5">
          <p className="text-sm">Informasi DPA</p>
          <div className="border rounded-md p-4 my-2">
            <div className="flex justify-between ">
              <div className="flex flex-col p-2">
                <p className="text-xs font-bold">
                  - Program: <span className="italic">{data?.program.kode} | {data?.program?.name}</span>
                </p>
                <p className="text-xs font-bold ml-2">
                  - Kegiatan: <span className="italic">{data?.kegiatan.kode} | {data?.kegiatan.name}</span>
                </p>
                <p className="text-xs font-bold ml-4">
                  - Sub Kegiatan: <span className="italic">{data?.subKegiatan.kode} | {data?.subKegiatan.name}</span>
                </p>

              </div>
              <div>
                <p>Total Pagu: Rp {data?.pagu?.toLocaleString('id-ID')}</p>
                <p>Terealisasi: Rp {data?.terrealisasi?.toLocaleString('id-ID')}</p>
                <p>Presentasi: {data?.terrealisasi! / data?.pagu! * 100} %</p>
              </div>
            </div>
            <Separator className="my-4" />
            <div className="border rounded-md p-4 my-2">
              <div className="flex justify-between">
                <div>
                  <p className="font-semibold">Belanja Operasi</p>
                  <p className="text-sm">Alokasi: Rp {data?.operasi?.toLocaleString('id-ID')}</p>
                  <p className="text-sm">Terealisasi: Rp {data?.orealiasi?.toLocaleString('id-ID')}</p>
                  <p className="text-sm">Sisa Alokasi: Rp {data?.osisa?.toLocaleString('id-ID')}</p>
                </div>
                <div>
                  <p className="font-semibold">Belanja Modal</p>
                  <p className="text-sm">Alokasi: Rp {data?.modal?.toLocaleString('id-ID')}</p>
                  <p className="text-sm">Terealisasi: Rp {data?.mrealisasi?.toLocaleString('id-ID')}</p>
                  <p className="text-sm">Sisa Alokasi: Rp {data?.msisa?.toLocaleString('id-ID')}</p>
                </div>
                <div>
                  <p className="font-semibold">Belanja Tidak Terduga</p>
                  <p className="text-sm">Alokasi: Rp {data?.takTerduga?.toLocaleString('id-ID')}</p>
                  <p className="text-sm">Terealisasi: Rp {data?.ttrealisasi?.toLocaleString('id-ID')}</p>
                  <p className="text-sm">Sisa Alokasi: Rp {data?.ttsisa?.toLocaleString('id-ID')}</p>
                </div>
                <div>
                  <p className="font-semibold">Belanja Transfer</p>
                  <p className="text-sm">Alokasi: Rp {data?.transfer?.toLocaleString('id-ID')}</p>
                  <p className="text-sm">Terealisasi: Rp {data?.trealisasi?.toLocaleString('id-ID')}</p>
                  <p className="text-sm">Sisa Alokasi: Rp {data?.tsisa?.toLocaleString('id-ID')}</p>
                </div>
              </div>
            </div>
            <Separator className="my-4" />
            <div className="grid grid-cols-12 gap-4">
              {data?.form?.map((v, i) => (
                <Fragment key={v.id}>
                  <Button variant={show === i ? 'default' : 'outline'} onClick={() => setShow(i)}>{v.monthName}</Button>
                </Fragment>
              ))}
            </div>
            <Separator className="my-4" />
            {show !== undefined &&
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                  <div>
                    <div className="grid grid-cols-4 gap-4">
                      <MoneyInput
                        className="flex-1"
                        form={form}
                        label="Belanja Operasi"
                        name="operasi"
                        placeholder="Rp 0"
                      />
                      <MoneyInput
                        className="flex-1"
                        form={form}
                        label="Belanja Modal"
                        name="modal"
                        placeholder="Rp 0"
                      />
                      <MoneyInput
                        className="flex-1"
                        form={form}
                        label="Belanja Tak Terduga"
                        name="takTerduga"
                        placeholder="Rp 0"
                      />
                      <MoneyInput
                        className="flex-1"
                        form={form}
                        label="Belanja Transfer"
                        name="transfer"
                        placeholder="Rp 0"
                      />
                    </div>
                    <div className="mt-4">
                      <FormField
                        control={form.control}
                        name="keterangan"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Keterangan</FormLabel>
                            <FormControl>
                              <Input placeholder="Input keterangan" {...field} />
                            </FormControl>

                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                  <Button type="submit" className="w-full">Simpan</Button>
                </form>
              </Form>
            }
          </div>
        </div>
      </div>
    </Layout>
  )
}

export default Page
