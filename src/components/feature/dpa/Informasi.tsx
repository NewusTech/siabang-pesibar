import { zodResolver } from "@hookform/resolvers/zod"
import { useSession } from "next-auth/react"
import { useRouter } from "next/router"
import { useEffect, useMemo } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import DatePicker from "~/components/DatePicker"
import Breadcrumbs from "~/components/BreadCrumbs"
import MoneyInput from "~/components/MoneyInput"
import MultiStep from "~/components/MultiStep"
import SearchSelect from "~/components/SearchSelect"
import dpaMultistep from "~/components/constants/dpa-multistep"
import { Layout } from "~/components/layout"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form"
import { Input } from "~/components/ui/input"
import { Separator } from "~/components/ui/separator"
import { api } from "~/utils/api"

const formSchema = z.object({
  id: z.string().nullable(),
  no: z.string().min(2, {
    message: "name must be at least 2 characters.",
  }),
  jumlahAlokasi: z.number().min(1, {
    message: "Tidak boleh kosong",
  }),
  tahun: z.number(),
  dinas: z.string().nullable(),
  dateline: z.date().nullable().optional(),
})


const Informasi = () => {
  const router = useRouter()
  const id = router.query.slug![0]!

  const { data: sessionData } = useSession();
  const { data: dinas } = api.dinas.getSelect.useQuery()
  const { mutateAsync } = api.anggaran.setInformasi.useMutation()

  const { data: anggaran, refetch } = api.anggaran.get.useQuery({ id }, {
    enabled: id !== 'tambah'
  })

  const isFormDisabled = useMemo(() => {
    if (!anggaran?.dpa?.dateline) return false
    const today = new Date().setHours(0, 0, 0, 0)
    const dateline = new Date(anggaran.dpa.dateline).setHours(0, 0, 0, 0)
    return dateline < today
  }, [anggaran])

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      id: 'tambah',
      no: '',
      tahun: new Date().getFullYear(),
      jumlahAlokasi: 0,
      dinas: '',
      dateline: new Date(), 
    },
  })

  useEffect(() => {
    if (anggaran && anggaran.dpa) {
      form.setValue('id', id)
      form.setValue('no', anggaran.dpa.no as string)
      form.setValue('tahun', anggaran.dpa.tahun as number)
      form.setValue('jumlahAlokasi', anggaran.dpa.jumlahAlokasi as number)
      form.setValue('jumlahAlokasi', anggaran.dpa.jumlahAlokasi as number)
      form.setValue('dinas', anggaran.dpa.Dinas.id)
      form.setValue('dateline', anggaran.dpa.dateline as Date)
    }
  }, [anggaran, form, id])

  const handleSubmit = async (data: z.infer<typeof formSchema>) => {
    // if (isFormDisabled) return
    try {
      const result = await mutateAsync({ ...data, id })
      if (id === 'tambah') {
        router.push(`/anggaran/dpa/${result.data}/rincian`)
      } else {
        router.push(`/anggaran/dpa/${id}/rincian`)
      }
    } catch (error) {
      console.log("error", error)
    }
  }

  return (
    <Layout>
      <div className="container mx-auto mt-12">
        <div className="mb-5 space-y-1">
          <Breadcrumbs data={[{ name: "informasi dpa" }]} />
          <p className="font-semibold">Informasi DPA</p>
        </div>
        <MultiStep data={dpaMultistep} type="anggaran" onNext={form.handleSubmit(handleSubmit)} >
          <div className="my-5">
            <Form {...form}>
              <form className="space-y-4">
                {sessionData?.user.role === 'admin' && <SearchSelect
                  data={dinas}
                  form={form}
                  label="Pilih OPD"
                  name="dinas"
                  placeholder="Pilih OPD"
                  disabled={isFormDisabled}
                />}
                <FormField
                  control={form.control}
                  name="no"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>No DPA</FormLabel>
                      <FormControl>
                        <Input disabled={isFormDisabled} placeholder="No DPA" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Separator className="my-4" />
                <div className="flex justify-between space-x-4">
                  <FormField
                    control={form.control}
                    name="tahun"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tahun</FormLabel>
                        <FormControl>
                          <Input disabled  {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <MoneyInput
                    disabled={isFormDisabled}
                    className="flex-1"
                    form={form}
                    label="Jumlah Alokasi"
                    name="jumlahAlokasi"
                    placeholder="Rp 0"
                  />
                </div>
                <DatePicker form={form} name="dateline" disabled={isFormDisabled} label="Batas Waktu" />
              </form>
            </Form>
          </div>
        </MultiStep>
      </div>
    </Layout>
  )
}

export default Informasi