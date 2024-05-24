import { useRouter } from "next/router"
import Breadcrumbs from "~/components/BreadCrumbs"
import { Layout } from "~/components/layout"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs"
import DataUmum from "~/components/feature/monitoring/DataUmum"
import Informasi from "~/components/feature/monitoring/Informasi"
import Dokumentasi from "~/components/feature/monitoring/Dokumentasi"
import Blanko from "~/components/feature/monitoring/Blanko"


const Page = () => {
  const router = useRouter()
  const id = router.query.id as string
  return (
    <Layout>
      <div className="container mx-auto mt-12">
        <div className="mb-5 space-y-1">
          <Breadcrumbs data={[{ name: "Monitoring" }, { name: 'Informasi' }]} />
          <p className="font-semibold">Informasi</p>
        </div>
        <Tabs defaultValue="umum" >
          <div className="flex justify-center">
            <TabsList>
              <TabsTrigger value="umum">Data Umum</TabsTrigger>
              <TabsTrigger value="blanko">Blanko Monitoring</TabsTrigger>
              <TabsTrigger value="dokumentasi">Dokumentasi</TabsTrigger>
              <TabsTrigger value="informasi">Informasi Pembangunan</TabsTrigger>
            </TabsList>
          </div>
          <TabsContent value="umum">
            {id && <DataUmum id={id} />}
          </TabsContent>
          <TabsContent value="blanko">
            <Blanko id={id} />
          </TabsContent>
          <TabsContent value="dokumentasi">
            <Dokumentasi id={id} />
          </TabsContent>
          <TabsContent value="informasi">
            <Informasi id={id} />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  )
}

export default Page