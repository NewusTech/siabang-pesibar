import { useRouter } from "next/router"
import Breadcrumbs from "~/components/BreadCrumbs"
import JenisDana from "~/components/feature/sumberdana/JenisDana"
import KelompokDana from "~/components/feature/sumberdana/KelompokDana"
import ObjekDana from "~/components/feature/sumberdana/ObjekDana"
import RincianDana from "~/components/feature/sumberdana/RincianDana"
import SubRincianDana from "~/components/feature/sumberdana/SubRincianDana"

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
    return <SubRincianDana />
  }else if (slug.length === 4) {
    return <RincianDana />
  } else if (slug.length === 3) {
     return <ObjekDana />
  } else if (slug.length === 2) {
    return <JenisDana/>
  } else if (slug.length === 1) {
    return <KelompokDana />
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
