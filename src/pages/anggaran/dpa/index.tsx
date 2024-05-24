import Link from "next/link"
import Breadcrumbs from "~/components/BreadCrumbs"
import { DataTable } from "~/components/feature/table/data-table"
import { Layout } from "~/components/layout"
import { Button } from "~/components/ui/button"
import { api } from "~/utils/api"
import { createColumnHelper } from "@tanstack/react-table"

type dpa = {
  id: any
  no: any
  urusan: any
  tahun: any
}

const columnHelper = createColumnHelper<dpa>()

const columns = [
  columnHelper.accessor('urusan', {
    header: () => 'Urusan',
    cell: info => info.getValue(),
  }),
]

const Page = () => {
  const { data } = api.anggaran.getList.useQuery()

  return (
    <Layout>
      <div className="container mx-auto mt-12">
        <div className="mb-5 space-y-1">
          <Breadcrumbs data={[{ name: "DPA" }]} />
          <p className="font-semibold">List DPA</p>
        </div>
        <DataTable
          data={!data ? [] : data}
          columns={[
            {
              id: "no",
              header: () => "OPD / No DPA",
              cell: ({ row }: { row: any }) => (
                <div className="flex flex-col">
                  <p className="font-semibold">{row.original.no}</p>
                  <p className="text-sm">{row.original.dinas}</p>
                </div>

              ),
            },
            {
              id: 'tahun',
              header: () => "Tahun",
              accessorFn: (row: any) => row.tahun
            },
            ...columns,
            {
              id: "actions",
              header: () => "Detail",
              meta: {
                align: 'right'
              },
              cell: ({ row }: { row: any }) => (
                <Link href={`dpa/${row.original.id}`}>
                  <Button>Detail</Button>
                </Link>
              ),
            }
          ]}
          filterBy="urusan"
          option={
            <Link href='dpa/tambah'>
              <Button>Tambah</Button>
            </Link>
          }
        />
      </div>
    </Layout>
  )
}

export default Page