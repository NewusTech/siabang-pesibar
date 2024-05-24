import { useRouter } from "next/router"
import Breadcrumbs from "~/components/BreadCrumbs"
import MultiStep from "~/components/MultiStep"
import dpaMultistep from "~/components/constants/dpa-multistep"
import { Layout } from "~/components/layout"
import { Separator } from "~/components/ui/separator"
import { api } from "~/utils/api"
import { DataTable } from "~/components/feature/table/data-table"
import { useEffect, useState } from "react"

const ResultBangun = () => {
  const router = useRouter()
  const id = router.query.slug![0]!

  const { data: pembangunan } = api.pembangunan.get.useQuery({ id }, {
    enabled: id !== 'tambah'
  })

  const [kegiatanId, setKegiatanId] = useState('');

  useEffect(() => {
    if (pembangunan && pembangunan.dpa && pembangunan.dpa.kegiatanId) {
      setKegiatanId(pembangunan.dpa.kegiatanId);
    }
  }, [pembangunan]);

  const { data: sub } = api.pembangunan.getSubKegiatan.useQuery({ id, kegiatanId }, {
    enabled: !!kegiatanId,
  });

  return (
    <Layout>
      <div className="container mx-auto mt-12">
        <div className="mb-5 space-y-1">
          <Breadcrumbs data={[{ name: "Result DPA" }]} />
          <p className="font-normal">Result DPA</p>
        </div>
        <MultiStep data={dpaMultistep} type="pembangunan" onNext={() => {
          router.push(`/pembangunan/laporan`)
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
                    value={pembangunan?.dpa?.Dinas?.name ?? ''} readOnly
                  />
                </div>
                <div>
                  <p className="font-thin mb-1">No. DPA</p>
                  <input
                    className=
                    "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={pembangunan?.dpa?.no ?? ''} readOnly
                  />
                </div>
                <div>
                  <p className="font-thin mb-1">Tahun</p>
                  <input
                    className=
                    "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={pembangunan?.dpa?.tahun ?? ''} readOnly
                  />
                </div>
                <div>
                  <p className="font-thin mb-1">Jumlah Alokasi</p>
                  <input
                    className=
                    "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={pembangunan?.dpa?.jumlahAlokasi ?? ''} readOnly
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
                    value={pembangunan?.rincian?.urusan?.name ?? ''} readOnly
                  />
                </div>
                <div>
                  <p className="font-thin mb-1">Bidang</p>
                  <input
                    className=
                    "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={pembangunan?.rincian?.bidang?.name ?? ''} readOnly
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="font-thin mb-1">Program</p>
                  <input
                    className=
                    "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={pembangunan?.rincian?.program?.name ?? ''} readOnly
                  />
                </div>
                <div>
                  <p className="font-thin mb-1">Kegiatan</p>
                  <input
                    className=
                    "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={pembangunan?.rincian?.kegiatan?.name ?? ''} readOnly
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="font-thin mb-1">Organisasi</p>
                  <input
                    className=
                    "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={pembangunan?.rincian?.organisasi?.name ?? ''} readOnly
                  />
                </div>
                <div>
                  <p className="font-thin mb-1">Unit</p>
                  <input
                    className=
                    "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={pembangunan?.rincian?.unit?.name ?? ''} readOnly
                  />
                </div>
              </div>

              <Separator className="my-4" />

              <p className="font-semibold">Sub Kegiatan</p>
              <div className="border rounded-md p-4 my-2">
                <div className="flex justify-between ">
                  <div>
                    <p>DPA: {pembangunan?.dpa?.no}</p>
                    <p>OPD: {pembangunan?.dpa?.Dinas.name}</p>
                    <p>Tahun: {pembangunan?.dpa?.createdAt.getFullYear()}</p>
                  </div>
                  <div>

                    <p>Alokasi: Rp {pembangunan?.dpa?.jumlahAlokasi?.toLocaleString('id-ID')}</p>
                    <p>Ter Alokasi: Rp {pembangunan?.dpa?.teralokasi?.toLocaleString('id-ID')}</p>
                    <p>Sisa Alokasi: Rp {pembangunan?.dpa?.sisaAlokasi?.toLocaleString('id-ID')}</p>
                  </div>
                </div>
                <Separator className="my-4" />
                <div className="flex flex-col p-2">
                  <p className="text-xs font-bold">
                    - Urusan: <span className="italic">{pembangunan?.rincian.urusan?.kode} | {pembangunan?.rincian.urusan?.name}</span>
                  </p>
                  <p className="text-xs font-bold ml-2">
                    - Bidang: <span className="italic">{pembangunan?.rincian.bidang?.kode} | {pembangunan?.rincian.bidang?.name}</span>
                  </p>
                  <p className="text-xs font-bold ml-4">
                    - Program: <span className="italic">{pembangunan?.rincian.program?.kode} | {pembangunan?.rincian.program?.name}</span>
                  </p>
                  <p className="text-xs font-bold ml-6">
                    - Kegiatan: <span className="italic">{pembangunan?.rincian.kegiatan?.kode} | {pembangunan?.rincian.kegiatan?.name}</span>
                  </p>
                  <p className="text-xs font-bold ml-4">
                    - Organisasi: <span className="italic">{pembangunan?.rincian.organisasi?.kode} | {pembangunan?.rincian.organisasi?.name}</span>
                  </p>
                  <p className="text-xs font-bold ml-6">
                    - Unit: <span className="italic">{pembangunan?.rincian.unit?.kode} | {pembangunan?.rincian.unit?.name}</span>
                  </p>
                </div>
              </div>
              <Separator className="my-4" />
              <div className="border rounded-md p-4 my-2">
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
                              -  <span className="italic">{row.original?.SubKegiatan?.kode} | {row.original?.SubKegiatan?.name}</span>
                            </p>
                            <p className="text-xs font-bold ml-2">
                              -  <span className="italic">{row.original.SumberDana.name}</span>
                            </p>
                          </div>
                        )
                      }
                    },
                    {
                      id: 'total',
                      header: () => "Total Pagu",
                      accessorFn: (row: any) => `Rp ${row.pagu?.toLocaleString('id-ID')}`
                    },
                  ]}
                  filterBy="name"

                />

              </div>

              <Separator className="my-4" />
            </form>

          </div>
        </MultiStep>
      </div>
    </Layout>
  )
}

export default ResultBangun