import { Layout } from "~/components/layout"
import { api } from "~/utils/api"

const Page = () => {
  const { data } = api.anggaran.get.useQuery({ id: "" })

  return (
    <Layout>
      <div className="flex justify-between ">
        <div>
          <p>DPA: {data?.dpa?.no}</p>
          <p>OPD: {data?.dpa?.Dinas.name}</p>
          <p>Tahun: {data?.dpa?.createdAt.getFullYear()}</p>
        </div>
        <div>

          <p>Alokasi: Rp {data?.dpa?.jumlahAlokasi?.toLocaleString('id-ID')}</p>
          <p>Ter Alokasi: Rp {data?.dpa?.teralokasi?.toLocaleString('id-ID')}</p>
          <p>Sisa Alokasi: Rp {data?.dpa?.sisaAlokasi?.toLocaleString('id-ID')}</p>
        </div>
      </div>

    </Layout>
  )
}

export default Page