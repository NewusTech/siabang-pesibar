import { useRouter } from "next/router"
import Breadcrumbs from "~/components/BreadCrumbs"
import Informasi from "~/components/feature/dpa/Informasi"
import PenggunaAnggaran from "~/components/feature/dpa/PenggunaAnggaran"
import RencanaPenarikan from "~/components/feature/dpa/RencanaPenarikan"
import ResultDpa from "~/components/feature/dpa/ResultDpa"
import Rincian from "~/components/feature/dpa/Rincian"
import SubKegiatan from "~/components/feature/dpa/SubKegiatan"
import TandaTangan from "~/components/feature/dpa/TandaTangan"
import { Layout } from "~/components/layout"

const Page = () => {
  const router = useRouter()
  const slug = router.query.slug as string[]

  if (!slug) {
    return (
      <div>loading</div>
    )
  }
  if (slug.length === 6) {
    return <TandaTangan />
  } if (slug.length === 5) {
    return <PenggunaAnggaran />
  } if (slug.length === 4) {
    return <RencanaPenarikan />
  } else if (slug.length === 3) {
    return <SubKegiatan />
  } else if (slug.length === 2) {
    if (slug[1] === 'rincian') {
      return <Rincian />
    } else {
      return <ResultDpa />
    }
  } else if (slug.length === 1) {
    if (slug[0] === 'tambah') {
      return <Informasi />
    } else {
      return <Informasi />
    }
  }

  return (
    <Layout>
      <div className="container mx-auto mt-12">
        <div className="mb-5 space-y-1">
          <Breadcrumbs data={[{ name: "informasi dpa" }]} />
          <p className="font-semibold">Informasi DPA</p>
        </div>
      </div>
    </Layout>
  )
}

export default Page
