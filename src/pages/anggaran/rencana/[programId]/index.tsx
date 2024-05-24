import { createColumnHelper } from "@tanstack/react-table"
import { DataTable } from "~/components/feature/table/data-table"
import { Layout } from "~/components/layout"
import { api } from "~/utils/api"
import Breadcrumbs from "~/components/BreadCrumbs"
import Link from "next/link"
import { Button } from "~/components/ui/button"
import { useRouter } from "next/router"

const Page = () => {
  const router = useRouter()
  const { data } = api.kegiatan.getByProgramId.useQuery({ id: router.query.programId as string })

  return (
    <Layout>
      <div className="container mx-auto mt-12">
        <div className="mb-5 space-y-1">
          <Breadcrumbs data={[{ name: "List Program" }, { name: "List Kegiatan" }]} />
          <p className="font-semibold">List Kegiatan</p>
        </div>
        <DataTable
          data={!data ? [] : data}
          columns={[
            {
              id: 'no',
              header: () => 'No',
              accessorFn: (a) => a.no
            },
            {
              id: 'kode',
              header: () => 'Kode',
              cell: ({ row }) => row.original.kode
            },
            {
              id: 'name',
              header: () => 'No',
              cell: ({ row }) => row.original.name
            },
            {
              id: "detail",
              header: () => "Detail",

              cell: ({ row }: { row: any }) => (
                <Link href={`${router.query.programId}/${row.original.id}`}>
                  <Button>Detail</Button>
                </Link>
              ),
            }
          ]}
          filterBy="name"
        />
      </div>
    </Layout>
  )
}

export default Page