import { createColumnHelper } from "@tanstack/react-table"
import { DataTable } from "~/components/feature/table/data-table"
import { Layout } from "~/components/layout"
import { api } from "~/utils/api"
import Breadcrumbs from "~/components/BreadCrumbs"
import Link from "next/link"
import { Button } from "~/components/ui/button"

type Rencana = {
  id: any
  kode: any
  no: any
  name: any
}

const columnHelper = createColumnHelper<Rencana>()

const columns = [
  columnHelper.accessor('name', {
    header: () => 'Nama',
    cell: info => info.getValue(),
  }),
]

const Page = () => {
  const { data } = api.program.get.useQuery()

  return (
    <Layout>
      <div className="container mx-auto mt-12">
        <div className="mb-5 space-y-1">
          <Breadcrumbs data={[{ name: "List Program" }]} />
          <p className="font-semibold">List Program</p>
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
            // {
            //   id: 'name',
            //   header: () => 'Nama',
            //   cell: ({ row }) => row.original.name
            // },
            ...columns,
            {
              id: "detail",
              header: () => "Detail",
              cell: ({ row }) => (
                <Link href={`rencana/${row.original.id}`}>
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