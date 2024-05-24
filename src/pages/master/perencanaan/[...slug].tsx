import { useRouter } from "next/router"
import Breadcrumbs from "~/components/BreadCrumbs"
import Bidang from "~/components/feature/perencanaan/Bidang"
import Kegiatan from "~/components/feature/perencanaan/Kegiatan"
import KegiatanSub from "~/components/feature/perencanaan/KegiatanSub"
import Program from "~/components/feature/perencanaan/Program"
import { Layout } from "~/components/layout"

const Page = () => {
  const router = useRouter()
  const slug = router.query.slug as string[]

  if (!slug) {
    return (
      <div>loading</div>
    )
  }
  if (slug.length === 4) {
    return <KegiatanSub />
  } else if (slug.length === 3) {
    return <Kegiatan />
  } else if (slug.length === 2) {
    return <Program />
  } else if (slug.length === 1) {
    return <Bidang />
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
