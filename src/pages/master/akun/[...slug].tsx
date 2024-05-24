import { useRouter } from "next/router"
import Breadcrumbs from "~/components/BreadCrumbs"
import JenisAkun from "~/components/feature/sumberakun/JenisAkun"
import KelompokAkun from "~/components/feature/sumberakun/KelompokAkun"
import ObjekAkun from "~/components/feature/sumberakun/ObjekAkun"
import RincianAkun from "~/components/feature/sumberakun/RincianAkun"
import SubRincianAkun from "~/components/feature/sumberakun/SubRincianAkun"
import { Layout } from "~/components/layout"

const Page = () => {
  const router = useRouter()
  const slug = router.query.slug as string[]

  if (!slug) {
    return (
      <div>loading</div>
    )
  }
  if (slug.length === 5) {
    return <SubRincianAkun />
  }else if (slug.length === 4) {
    return <RincianAkun />
  } else if (slug.length === 3) {
     return <ObjekAkun />
  } else if (slug.length === 2) {
    return <JenisAkun/>
  } else if (slug.length === 1) {
    return <KelompokAkun />
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
