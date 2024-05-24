import { useRouter } from "next/router"
import Breadcrumbs from "~/components/BreadCrumbs"
import MultiStep from "~/components/MultiStep"
import dpaMultistep from "~/components/constants/dpa-multistep"
import { Layout } from "~/components/layout"
import { Separator } from "~/components/ui/separator"
import { api } from "~/utils/api"
import { DataTable } from "../table/data-table"
import { useEffect, useState } from "react"
import { atom, useAtom } from 'jotai'
import { createColumnHelper } from "@tanstack/react-table"
import { flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table"

interface ATOM {
  total: any
  rencana: any
}

const theAtom = atom<ATOM>({ total: {}, rencana: [{}] })

const columns = [
  {
    accessorKey: "monthName",
    header: "Bulan",
  },
  {
    accessorKey: "operasi",
    header: "Belanja Operasi",
  },
  {
    accessorKey: "modal",
    header: "Belanja Modal",
  },
  {
    accessorKey: "takTerduga",
    header: "Belanja Tidak Terduga",
  },
  {
    accessorKey: "transfer",
    header: "Belanja Transfer",
  },
  {
    accessorKey: "total",
    header: "Total",
  },
];

type Pengguna = {
  id: string
  nama: string
  nip: string
  jabatan: string
  dpaId: string
  action: string
}

const columnHelper = createColumnHelper<Pengguna>()

const columnss = [
  columnHelper.accessor('nama', {
    header: () => 'Nama',
    cell: info => info.getValue(),
  }),
  columnHelper.accessor('nip', {
    header: () => 'NIP',
    cell: info => info.getValue(),
  }),
  columnHelper.accessor('jabatan', {
    header: () => 'Jabatan',
    cell: info => info.getValue(),
  }),
]

type Penggunaa = {
  id: string
  nama: string
  nip: string
  jabatan: string
  dpaId: string
  action: string
}

const columnHelperr = createColumnHelper<Penggunaa>()

const columnsss = [
  columnHelperr.accessor('nama', {
    header: () => 'Nama',
    cell: info => info.getValue(),
  }),
  columnHelperr.accessor('nip', {
    header: () => 'NIP',
    cell: info => info.getValue(),
  }),
  columnHelperr.accessor('jabatan', {
    header: () => 'Jabatan',
    cell: info => info.getValue(),
  }),
]

const RencanaTable = ({ defaultValues, setData }: any) => {
  const table = useReactTable({
    data: defaultValues.rencana,
    columns,
    getCoreRowModel: getCoreRowModel(),
    meta: {
      updateData: (rowIndex: any, columnId: any, value: any) => {
        setData((prev: any) => {

          let newData = prev.rencana.map((row: any, index: any) => {
            if (index === rowIndex) {
              const updatedRow = { ...row, [columnId]: value };
              const total = updatedRow.operasi + updatedRow.modal + updatedRow.takTerduga + updatedRow.transfer;
              return { ...updatedRow, total };
            }
            return row;
          });

          const newTerAlokasi = newData.map((v: any) => v[columnId]).reduce((accumulator: any, currentValue: any) => accumulator + currentValue, 0)

          let newTotal = { ...prev.total };
          if (newTotal[columnId]) {
            newTotal[columnId].teralokasi = newTerAlokasi;

            newTotal[columnId].sisa = newTotal[columnId].alokasi - newTerAlokasi
          }

          return {
            total: newTotal,
            rencana: newData
          };
        });
      }
    },
  })

  return (
    <Table>
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
  )
}

const ResultDpa = () => {
  const router = useRouter()
  const id = router.query.slug![0]!

  const { data: anggaran } = api.anggaran.get.useQuery({ id }, {
    enabled: id !== 'tambah'
  })

  const [kegiatanId, setKegiatanId] = useState('');

  useEffect(() => {
    if (anggaran && anggaran?.dpa?.kegiatanId) {
      setKegiatanId(anggaran?.dpa?.kegiatanId);
    }
  }, [anggaran]);

  const { data: sub } = api.anggaran.getSubKegiatan.useQuery({ id, kegiatanId }, {
    enabled: !!kegiatanId,
  });

  const { data: rencana } = api.anggaran.getRencanaPenarikan.useQuery({ dpaId: id })
  const { data: pengguna } = api.anggaran.getPengguna.useQuery({ id })
  const { data: penggunattd } = api.anggaran.getTtd.useQuery({ id })

  const [dataanggaran, setDataanggaran] = useAtom(theAtom)

  useEffect(() => {
    setDataanggaran({
      total: {
        operasi: {
          alokasi: anggaran?.dpa?.operasi,
          teralokasi: anggaran?.dpa?.oteralokasi,
          sisa: anggaran?.dpa?.osisaAlokasi
        },
        modal: {
          alokasi: anggaran?.dpa?.modal,
          teralokasi: anggaran?.dpa?.mteralokasi,
          sisa: anggaran?.dpa?.msisaAlokasi
        },
        takTerduga: {
          alokasi: anggaran?.dpa?.takTerduga,
          teralokasi: anggaran?.dpa?.ttteralokasi,
          sisa: anggaran?.dpa?.ttsisaAlokasi
        },
        transfer: {
          alokasi: anggaran?.dpa?.transfer,
          teralokasi: anggaran?.dpa?.tteralokasi,
          sisa: anggaran?.dpa?.tsisaAlokasi
        }
      },
      rencana: rencana
    })
  }, [anggaran, rencana, setDataanggaran])

  return (
    <Layout>
      <div className="container mx-auto mt-12">
        <div className="mb-5 space-y-1">
          <Breadcrumbs data={[{ name: "Result DPA" }]} />
          <p className="font-normal">Result DPA</p>
        </div>
        <MultiStep data={dpaMultistep} type="anggaran" onNext={() => {
          router.push(`/anggaran/laporan`)
        }}>
          <div className="my-5">

            <form className="space-y-4">
              <p className="font-semibold">Informasi DPA</p>
              <div className="grid grid-cols-4 gap-4">
                <div>
                  <p className="font-thin mb-1">OPD</p>
                  <input
                    className=
                    "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={anggaran?.dpa?.Dinas?.name ?? ''} readOnly
                  />
                </div>
                <div>
                  <p className="font-thin mb-1">No. DPA</p>
                  <input
                    className=
                    "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={anggaran?.dpa?.no ?? ''} readOnly
                  />
                </div>
                <div>
                  <p className="font-thin mb-1">Tahun</p>
                  <input
                    className=
                    "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={anggaran?.dpa?.tahun ?? ''} readOnly
                  />
                </div>
                <div>
                  <p className="font-thin mb-1">Jumlah Alokasi</p>
                  <input
                    className=
                    "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={anggaran?.dpa?.jumlahAlokasi ?? ''} readOnly
                  />
                </div>
              </div>

              <Separator className="my-4" />

              <p className="font-semibold">Rincian DPA</p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="font-thin mb-1">Urusan</p>
                  <input
                    className=
                    "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={anggaran?.rincian?.urusan?.name ?? ''} readOnly
                  />
                </div>
                <div>
                  <p className="font-thin mb-1">Bidang</p>
                  <input
                    className=
                    "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={anggaran?.rincian?.bidang?.name ?? ''} readOnly
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="font-thin mb-1">Program</p>
                  <input
                    className=
                    "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={anggaran?.rincian?.program?.name ?? ''} readOnly
                  />
                </div>
                <div>
                  <p className="font-thin mb-1">Kegiatan</p>
                  <input
                    className=
                    "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={anggaran?.rincian?.kegiatan?.name ?? ''} readOnly
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="font-thin mb-1">Organisasi</p>
                  <input
                    className=
                    "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={anggaran?.rincian?.organisasi?.name ?? ''} readOnly
                  />
                </div>
                <div>
                  <p className="font-thin mb-1">Unit</p>
                  <input
                    className=
                    "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={anggaran?.rincian?.unit?.name ?? ''} readOnly
                  />
                </div>
              </div>

              <Separator className="my-4" />

              <p className="font-semibold">Sub Kegiatan</p>
              <DataTable
                data={!sub?.data ? [] : sub.data}

                columns={[
                  {
                    id: 'name',
                    header: () => "SUB KEGIATAN / SUMBER DANA / LOKASI",
                    cell: ({ row }) => {
                      return (
                        <div className="flex flex-col p-2">
                          <p className="text-xs font-bold">
                            -  <span className="italic">{row.original.subkegiatan.kode} | {row.original.subkegiatan.name}</span>
                          </p>
                          <p className="text-xs font-bold ml-2">
                            -  <span className="italic">{row.original.SumberDana.name}</span>
                          </p>
                          <p className="text-xs font-bold ml-4">
                            -  <span className="italic">{row.original.lokasi}</span>
                          </p>
                        </div>
                      )
                    }
                  },
                  {
                    id: 'total',
                    header: () => "Total Pagu",
                    accessorFn: (row: any) => `Rp ${row.total.toLocaleString('id-ID')}`
                  },

                ]}
                filterBy="name"
              />

              <Separator className="my-4" />

              <p className="font-semibold">Rencana Penarikan</p>
              <div className="border rounded-md p-4 my-2">
                <div className="flex justify-between ">
                  <div>
                    <p>Alokasi: Rp {anggaran?.dpa?.jumlahAlokasi?.toLocaleString('id-ID')}</p>
                    <p>Ter Alokasi: Rp {anggaran?.dpa?.teralokasi?.toLocaleString('id-ID')}</p>
                    <p>Sisa Alokasi: Rp {anggaran?.dpa?.sisaAlokasi?.toLocaleString('id-ID')}</p>
                  </div>
                </div>
              </div>
              <div className="border rounded-md p-4 my-2">
                <div className="flex justify-between">
                  <div>
                    <p className="font-semibold">Belanja Operasi</p>
                    <p className="text-sm">Alokasi: Rp {dataanggaran?.total?.operasi?.alokasi?.toLocaleString('id-ID')}</p>
                    <p className="text-sm">Teralokasi: Rp {dataanggaran?.total?.operasi?.teralokasi?.toLocaleString('id-ID')}</p>
                    <p className="text-sm">Sisa Alokasi: Rp {dataanggaran?.total?.operasi?.sisa?.toLocaleString('id-ID')}</p>
                  </div>
                  <div>
                    <p className="font-semibold">Belanja Modal</p>
                    <p className="text-sm">Alokasi: Rp {dataanggaran?.total?.modal?.alokasi?.toLocaleString('id-ID')}</p>
                    <p className="text-sm">Teralokasi: Rp {dataanggaran?.total?.modal?.teralokasi?.toLocaleString('id-ID')}</p>
                    <p className="text-sm">Sisa Alokasi: Rp {dataanggaran?.total?.modal?.sisa?.toLocaleString('id-ID')}</p>
                  </div>
                  <div>
                    <p className="font-semibold">Belanja Tidak Terduga</p>
                    <p className="text-sm">Alokasi: Rp {dataanggaran?.total?.takTerduga?.alokasi?.toLocaleString('id-ID')}</p>
                    <p className="text-sm">Teralokasi: Rp {dataanggaran?.total?.takTerduga?.teralokasi?.toLocaleString('id-ID')}</p>
                    <p className="text-sm">Sisa Alokasi: Rp {dataanggaran?.total?.takTerduga?.sisa?.toLocaleString('id-ID')}</p>
                  </div>
                  <div>
                    <p className="font-semibold">Belanja Transfer</p>
                    <p className="text-sm">Alokasi: Rp {dataanggaran?.total?.transfer?.alokasi?.toLocaleString('id-ID')}</p>
                    <p className="text-sm">Teralokasi: Rp {dataanggaran?.total?.transfer?.teralokasi?.toLocaleString('id-ID')}</p>
                    <p className="text-sm">Sisa Alokasi: Rp {dataanggaran?.total?.transfer?.sisa?.toLocaleString('id-ID')}</p>
                  </div>
                </div>
              </div>
              <div className="rounded-md border">
                {dataanggaran.rencana && <RencanaTable defaultValues={dataanggaran} setData={setDataanggaran} />}
              </div>

              <Separator className="my-4" />

              <p className="font-semibold">Pengguna Anggaran</p>
              <DataTable
                data={!pengguna ? [] : pengguna}
                columns={[
                  ...columnss,
                ]}
                filterBy="nama"
              />

              <Separator className="my-4" />
              <p className="font-semibold">Tanda Tangan</p>
              <DataTable
                data={!penggunattd ? [] : penggunattd}
                columns={[
                  ...columnsss,

                ]}
                filterBy="nama"
              />

            </form>

          </div>
        </MultiStep>
      </div>
    </Layout>
  )
}

export default ResultDpa