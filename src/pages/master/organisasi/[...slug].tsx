import { useRouter } from "next/router"
import Breadcrumbs from "~/components/BreadCrumbs"
import Unit from "~/components/feature/organisasi/Unit"
import { Layout } from "~/components/layout"

const Page = () => {
  const router = useRouter()
  const slug = router.query.slug as string[]

  if (!slug) {
    return (
      <div>loading</div>
    )
  }
 if (slug.length === 1) {
    return <Unit />
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
