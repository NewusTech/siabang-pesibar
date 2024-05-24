import { useRouter } from "next/router"
import Breadcrumbs from "~/components/BreadCrumbs"
import Informasi from "~/components/feature/pembangunan/Informasi"
import ResultBangun from "~/components/feature/pembangunan/ResultBangun"
import Rincian from "~/components/feature/pembangunan/Rincian"
import SubKegiatan from "~/components/feature/pembangunan/SubKegiatan"
import { Layout } from "~/components/layout"

const Page = () => {
  const router = useRouter()
  const slug = router.query.slug as string[]

  if (!slug) {
    return (
      <div>loading</div>
    )
  }

  if (slug.length === 3) {
    return <SubKegiatan />
  } else if (slug.length === 2) {
    if (slug[1] === 'rincian') {
      return <Rincian />
    } else {
      return <ResultBangun />
    }
  } else if (slug.length === 1) {
    return <Informasi />
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
