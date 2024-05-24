import Breadcrumbs from "~/components/BreadCrumbs"
import MultiStep from "~/components/MultiStep"
import dpaMultistep from "~/components/constants/dpa-multistep"
import { Layout } from "~/components/layout"
import { Separator } from "~/components/ui/separator"
import {
  Form
} from "~/components/ui/form"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import SearchSelect from "~/components/SearchSelect"
import { api } from "~/utils/api"
import { useRouter } from "next/router"
import { useEffect } from "react"
import pembangunanStep from "~/components/constants/pembangunan-multistep"

const formSchema = z.object({
  urusan: z.string({
    required_error: "wajib isi.",
  }),
  bidang: z.string({
    required_error: "wajib isi.",
  }),
  program: z.string({
    required_error: "wajib isi.",
  }),
  kegiatan: z.string({
    required_error: "wajib isi.",
  }),
  organisasi: z.string({
    required_error: "wajib isi.",
  }),
  unit: z.string({
    required_error: "wajib isi.",
  }),
})

const Rincian = () => {
  const router = useRouter()
  const id = router.query.slug![0]!
  const { data } = api.pembangunan.get.useQuery({ id })
  const { mutateAsync } = api.pembangunan.setRincian.useMutation()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema)
  })

  useEffect(() => {
    if (data && data.rincian) {
      const rincian = data.rincian
      for (const key in rincian) {
        // @ts-ignore
        if (rincian[key] !== undefined) {
          // @ts-ignore
          form.setValue(key, rincian[key].id)
        }
      }
    }
  }, [data, form])

  const handleSubmit = async (data: z.infer<typeof formSchema>) => {
    try {
      const result = await mutateAsync({ id, kegiatan: data.kegiatan, unit: data.unit })
      if (result.ok) {
        router.push(`/pembangunan/dpa/${id}/rincian/sub-kegiatan`)
      }
    } catch (error) {
      console.log("error", error)
    }
  }

  return (
    <Layout>
      <div className="container mx-auto mt-12">
        <div className="mb-5 space-y-1">
          <Breadcrumbs data={[{ name: "Informasi DPA" }, { name: "Rincian DPA" }]} />
          <p className="font-semibold">Informasi DPA</p>
        </div>
        <MultiStep data={pembangunanStep} type="pembangunan" onNext={form.handleSubmit(handleSubmit)} >
          <div className="my-5">
            <p className="text-sm">Informasi DPA</p>
            <div className="flex justify-between border rounded-md p-4 my-2">
              <div>
                <p>DPA: {data?.dpa?.no}</p>
                <p>OPD: {data?.dpa?.Dinas.name}</p>
                <p>Tahun: {data?.dpa?.createdAt.getFullYear()}</p>
              </div>
              <div>

                <p>Alokasi: Rp {data?.dpa?.jumlahAlokasi?.toLocaleString('id-ID')}</p>
              </div>
            </div>
            <Separator className="my-4" />
            <Form {...form}>
              <form className="grid grid-cols-2 gap-4">
                <SearchSelect
                  data={data?.urusan}
                  form={form}
                  label="Urusan"
                  name="urusan"
                  placeholder="Urusan"
                />
                <SearchSelect
                  data={data?.bidang.filter((v) => v.urusanId === form.watch('urusan'))}
                  form={form}
                  label="Bidang"
                  name="bidang"
                  placeholder="Bidang"
                  disabled={!form.watch('urusan')}
                />
                <SearchSelect
                  data={data?.program.filter((v) => v.bidangId === form.watch('bidang'))}
                  form={form}
                  label="Program"
                  name="program"
                  placeholder="Program"
                  disabled={!form.watch('bidang')}
                />
                <SearchSelect
                  data={data?.kegiatan.filter((v) => v.programId === form.watch('program'))}
                  form={form}
                  label="Kegiatan"
                  name="kegiatan"
                  placeholder="Kegiatan"
                  disabled={!form.watch('program')}
                />
                <SearchSelect
                  data={data?.organisasi}
                  form={form}
                  label="Organisasi"
                  name="organisasi"
                  placeholder="Organisasi"
                  disabled={!form.watch('kegiatan')}
                />
                <SearchSelect
                  data={data?.unit.filter((v) => v.organisasiId === form.watch('organisasi'))}
                  form={form}
                  label="Unit"
                  name="unit"
                  placeholder="Unit"
                  disabled={!form.watch('organisasi')}
                />
              </form>
            </Form>
          </div>
        </MultiStep>
      </div>
    </Layout>
  )
}

export default Rincian