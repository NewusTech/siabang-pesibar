import { Layout } from "~/components/layout"
import { api } from "~/utils/api"
import Breadcrumbs from "~/components/BreadCrumbs"
import Link from "next/link"
import { Button } from "~/components/ui/button"
import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { flexRender, getCoreRowModel, useReactTable, type ColumnFiltersState, getFilteredRowModel, } from "@tanstack/react-table"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table"
import { Input } from "~/components/ui/input"
import { Cross2Icon } from "@radix-ui/react-icons"
import { DataTablePagination } from "~/components/feature/table/table-pagination"

const columns = [
  {
    accessorKey: "no",
    header: "No",
    cell: (info: any) => info.getValue(),
  },
  {
    id: "sub",
    header: () => "Sub Kegiatan",
    cell: ({ row }: { row: any }) => (
      <div>
        <p>{row.original.SubKegiatan.kode}</p>
        <p>{row.original.SubKegiatan.name}</p>
      </div>
    ),
  },
  {
    id: "dinastahun",
    header: () => "OPD / Tahun",
    cell: ({ row }: { row: any }) => (
      <div>
        <p>OPD: {row.original.Dinas.name}</p>
        <p>Tahun: {row.original.tahun}</p>
      </div>
    ),
  },
  {
    id: "pagu",
    header: () => "Total Pagu",
    cell: ({ row }: { row: any }) => (
      <div>
        <p>Rp {row.original.pagu.toLocaleString("id-ID")}</p>
        <p>Terealisasi</p>
        <p>Rp {row.original.pagu}</p>
      </div>
    ),
  },
  {
    accessorKey: 'status',
    header: () => "Status",
    cell: (info: any) => info.getValue(),
  },
]

const TheTable = ({ defaultValues, kegiatanId, programId }: { defaultValues: any, kegiatanId: string, programId: string }) => {
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>(
    [
      { id: 'tahunhid', value: new Date().getFullYear().toString() }
    ]
  )

  const table = useReactTable({
    data: defaultValues,
    columns: [
      ...columns,
      {
        id: "detail",
        header: () => "Detail",
        cell: ({ row }: { row: any }) => (
          <Link href={`/anggaran/rencana/${programId}/${kegiatanId}/${row.original.id}`}>
            <Button>Detail</Button>
          </Link>
        ),
      },
      {
        id: 'dinashid',
        header: () => "OPD",
        // @ts-ignore
        accessorFn: (row) => row.Dinas.id,
      },
      {
        id: 'suba',
        header: () => "suba",
        // @ts-ignore
        accessorFn: (row) => row.SubKegiatan.name,
      },
      {
        id: 'tahunhid',
        header: () => "Tahun",
        accessorFn: (row) => row.tahun,
      },
    ],
    state: {
      columnFilters,
      columnVisibility: {
        dinashid: false,
        tahunhid: false,
        suba: false
      }
    },
    getCoreRowModel: getCoreRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
  })

  const isFiltered = table.getState().columnFilters.length > 0

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex flex-1 items-center space-x-2">
          <Input
            placeholder="Cari subkegiatan ..."
            value={(table.getColumn('suba')?.getFilterValue() as string) ?? ""}
            onChange={(event) =>
              table.getColumn('suba')?.setFilterValue(event.target.value)
            }
            className="h-8 w-[150px] lg:w-[250px]"
          />
          <Input
            placeholder="Tahun"
            value={(table.getColumn('tahunhid')?.getFilterValue() as string) ?? ""}
            onChange={(event) => {
              table.getColumn('tahunhid')?.setFilterValue(event.target.value)
            }}
            type="number"
            className="h-8 w-[150px] lg:w-[100px]"
          />
          {isFiltered && (
            <Button
              variant="ghost"
              onClick={() => table.resetColumnFilters()}
              className="h-8 px-2 lg:px-3"
            >
              Reset
              <Cross2Icon className="ml-2 h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
      <div className="rounded-md border">
        <Table >
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id} colSpan={header.colSpan}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <DataTablePagination table={table} />
    </div>
  )
}

const Page = () => {
  const router = useRouter()
  const kegiatanId = router.query.kegiatanId as string
  const programId = router.query.programId as string
  const session = useSession()

  const [dinas, setDinas] = useState('')
  const [tahun, setTauhun] = useState(new Date().getFullYear())
  const { data } = api.realisasi.getListSubkegiatan.useQuery({ dinas, kegiatanId, tahun }, {
    enabled: !!dinas
  })

  useEffect(() => {
    if (session.data) {
      if (session.data.user.role === 'admin') {
        setDinas('all')
      } else {
        setDinas(session.data.user.dinas.id)
      }
    }
  }, [session])

  return (
    <Layout>
      <div className="container mx-auto mt-12">
        <div className="mb-5 space-y-1">
          <Breadcrumbs data={[{ name: "List Program" }, { name: "List Kegiatan" }, { name: 'List Sub Kegiatan' }]} />
          <p className="font-semibold">List Sub Kegiatan</p>
        </div>
        {data && data.list &&
          <TheTable
            defaultValues={!data?.list ? [] : data.list}
            kegiatanId={router.query.kegiatanId as string}
            programId={router.query.programId as string}
          />}
      </div>
    </Layout>
  )
}

export default Page