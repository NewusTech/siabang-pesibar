import { flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table"
import { useRouter } from "next/router"
import { useEffect } from "react"
import Breadcrumbs from "~/components/BreadCrumbs"
import EditableCell from "~/components/EditableCell"
import MultiStep from "~/components/MultiStep"
import dpaMultistep from "~/components/constants/dpa-multistep"
import { Layout } from "~/components/layout"
import { Separator } from "~/components/ui/separator"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table"
import { api } from "~/utils/api"
import { atom, useAtom } from 'jotai'


interface ATOM {
  total: any
  rencana: any
}

const theAtom = atom<ATOM>({ total: {}, rencana: [{}] })

const columns = [
  {
    accessorKey: "monthName",
    header: "Bulan",
    cell: (info: any) => info.getValue(),
  },
  {
    accessorKey: "operasi",
    header: "Belanja Operasi",
    cell: EditableCell,
  },
  {
    accessorKey: "modal",
    header: "Belanja Modal",
    cell: EditableCell,
  },
  {
    accessorKey: "takTerduga",
    header: "Belanja Tidak Terduga",
    cell: EditableCell,
  },
  {
    accessorKey: "transfer",
    header: "Belanja Transfer",
    cell: EditableCell,
  },
  {
    accessorKey: "total",
    header: "Total",
    cell: (info: any) => `Rp ${info?.getValue()?.toLocaleString('id-ID')}`,
  },
];

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


const RencanaPenarikan = () => {
  const router = useRouter()
  const id = router.query.slug![0]!

  const { data: anggaran, refetch: refetchAnggaran } = api.anggaran.get.useQuery({ id })
  const { data: rencana, refetch: refetchRencana } = api.anggaran.getRencanaPenarikan.useQuery({ dpaId: id })
  const [data, setData] = useAtom(theAtom)
  const { mutateAsync } = api.anggaran.setRencanaPenarikan.useMutation()

  useEffect(() => {
    setData({
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
  }, [anggaran, rencana, setData])

  const handleNext = async () => {
    try {
      const result = await mutateAsync({ id, rencana: data.rencana, total: data.total })
      if (result.ok) {
        refetchAnggaran()
        refetchRencana()
        router.push(`/anggaran/dpa/${id}/rincian/sub-kegiatan/rencana/pengguna`)
      }
    } catch (error) {
      console.log("error", error)
    }
  }


  return (
    <Layout>
      <div className="container mx-auto mt-12">
        <div className="mb-5 space-y-1">
          <Breadcrumbs data={[{ name: "informasi dpa" }]} />
          <p className="font-semibold">Informasi DPA</p>
        </div>
        <MultiStep data={dpaMultistep} type="anggaran" onNext={handleNext} >
          <div className="my-5">
            <p className="text-sm">Informasi DPA</p>
            <div className="border rounded-md p-4 my-2">
              <div className="flex justify-between ">
                <div>
                  <p>DPA: {anggaran?.dpa?.no}</p>
                  <p>OPD: {anggaran?.dpa?.Dinas.name}</p>
                  <p>Tahun: {anggaran?.dpa?.createdAt.getFullYear()}</p>
                </div>
                <div>

                  <p>Alokasi: Rp {anggaran?.dpa?.jumlahAlokasi?.toLocaleString('id-ID')}</p>
                  <p>Ter Alokasi: Rp {anggaran?.dpa?.teralokasi?.toLocaleString('id-ID')}</p>
                  <p>Sisa Alokasi: Rp {anggaran?.dpa?.sisaAlokasi?.toLocaleString('id-ID')}</p>
                </div>
              </div>
            </div>
            <Separator className="my-4" />
            <div className="border rounded-md p-4 my-2">
              <div className="flex justify-between">
                <div>
                  <p className="font-semibold">Belanja Operasi</p>
                  <p className="text-sm">Alokasi: Rp {data.total.operasi?.alokasi?.toLocaleString('id-ID')}</p>
                  <p className="text-sm">Teralokasi: Rp {data.total.operasi?.teralokasi?.toLocaleString('id-ID')}</p>
                  <p className="text-sm">Sisa Alokasi: Rp {data.total.operasi?.sisa?.toLocaleString('id-ID')}</p>
                </div>
                <div>
                  <p className="font-semibold">Belanja Modal</p>
                  <p className="text-sm">Alokasi: Rp {data.total.modal?.alokasi?.toLocaleString('id-ID')}</p>
                  <p className="text-sm">Teralokasi: Rp {data.total.modal?.teralokasi?.toLocaleString('id-ID')}</p>
                  <p className="text-sm">Sisa Alokasi: Rp {data.total.modal?.sisa?.toLocaleString('id-ID')}</p>
                </div>
                <div>
                  <p className="font-semibold">Belanja Tidak Terduga</p>
                  <p className="text-sm">Alokasi: Rp {data.total.takTerduga?.alokasi?.toLocaleString('id-ID')}</p>
                  <p className="text-sm">Teralokasi: Rp {data.total.takTerduga?.teralokasi?.toLocaleString('id-ID')}</p>
                  <p className="text-sm">Sisa Alokasi: Rp {data.total.takTerduga?.sisa?.toLocaleString('id-ID')}</p>
                </div>
                <div>
                  <p className="font-semibold">Belanja Transfer</p>
                  <p className="text-sm">Alokasi: Rp {data.total.transfer?.alokasi?.toLocaleString('id-ID')}</p>
                  <p className="text-sm">Teralokasi: Rp {data.total.transfer?.teralokasi?.toLocaleString('id-ID')}</p>
                  <p className="text-sm">Sisa Alokasi: Rp {data.total.transfer?.sisa?.toLocaleString('id-ID')}</p>
                </div>
              </div>
            </div>
            <Separator className="my-4" />
            <div className="rounded-md border">
              {data.rencana && <RencanaTable defaultValues={data} setData={setData} />}
            </div>
          </div>
        </MultiStep>
      </div>
    </Layout>
  )
}

export default RencanaPenarikan