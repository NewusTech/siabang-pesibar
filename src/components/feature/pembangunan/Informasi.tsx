import { zodResolver } from "@hookform/resolvers/zod"
import { useSession } from "next-auth/react"
import { useRouter } from "next/router"
import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import Breadcrumbs from "~/components/BreadCrumbs"
import MoneyInput from "~/components/MoneyInput"
import MultiStep from "~/components/MultiStep"
import SearchSelect from "~/components/SearchSelect"
import pembangunanStep from "~/components/constants/pembangunan-multistep"
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
  dinas: z.string().nullable()
})

const Informasi = () => {
  const router = useRouter()
  const id = router.query.slug![0]!

  const { data: sessionData } = useSession();
  const { data: dinas } = api.dinas.getSelect.useQuery()
  const { mutateAsync } = api.pembangunan.setInformasi.useMutation()

  const { data: pembangunan, refetch } = api.pembangunan.get.useQuery({ id }, {
    enabled: id !== 'tambah'
  })

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      id: 'tambah',
      no: '',
      tahun: new Date().getFullYear(),
      jumlahAlokasi: 0,
      dinas: ''
    },
  })

  useEffect(() => {
    if (pembangunan && pembangunan.dpa) {
      form.setValue('id', id)
      form.setValue('no', pembangunan.dpa.no as string)
      form.setValue('tahun', pembangunan.dpa.tahun as number)
      form.setValue('jumlahAlokasi', pembangunan.dpa.jumlahAlokasi as number)
      form.setValue('dinas', pembangunan.dpa.Dinas.id)
    }
  }, [pembangunan, form, id])

  const handleSubmit = async (data: z.infer<typeof formSchema>) => {
    try {
      const result = await mutateAsync({ ...data, id })
      if (id === 'tambah') {
        router.push(`/pembangunan/dpa/${result.data}/rincian`)
      } else {
        router.push(`/pembangunan/dpa/${id}/rincian`)
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
        <MultiStep data={pembangunanStep} type="pembangunan" onNext={form.handleSubmit(handleSubmit)} >
          <div className="my-5">
            <Form {...form}>
              <form className="space-y-4">
                {sessionData?.user.role === 'admin' && <SearchSelect
                  data={dinas}
                  form={form}
                  label="Pilih OPD"
                  name="dinas"
                  placeholder="Pilih OPD"
                />}
                <FormField
                  control={form.control}
                  name="no"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>No DPA</FormLabel>
                      <FormControl>
                        <Input placeholder="No DPA" {...field} />
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
                    className="flex-1"
                    form={form}
                    label="Jumlah Alokasi"
                    name="jumlahAlokasi"
                    placeholder="Rp 0"
                  />
                </div>
              </form>
            </Form>
          </div>
        </MultiStep>
      </div>
    </Layout>
  )
}

export default Informasi