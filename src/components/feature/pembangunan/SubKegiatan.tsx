import { useRouter } from "next/router"
import Breadcrumbs from "~/components/BreadCrumbs"
import MultiStep from "~/components/MultiStep"
import { Layout } from "~/components/layout"
import { Separator } from "~/components/ui/separator"
import { api } from "~/utils/api"
import { DataTable } from "~/components/feature/table/data-table"
import { DataTableRowActions } from "../table/table-row-action"
import { Button } from "~/components/ui/button"
import { useEffect, useState } from "react"
import { DeleteModal } from "~/components/DeleteModal"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "~/components/ui/alert-dialog"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  Form,
} from "~/components/ui/form"
import SearchSelect from "~/components/SearchSelect"
import MoneyInput from "~/components/MoneyInput"
import pembangunanStep from "~/components/constants/pembangunan-multistep"

type SubKegiatan = {
  name: string
  total: string
  action: string
}

interface AddEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  item?: any; // You might want to replace any with a more specific type
  refetch: any
  refetchSub: any
  data: any
}

const formSchema = z.object({
  subKegiatan: z.string({ required_error: "wajib isi" }),
  sumberDana: z.string({ required_error: "wajib isi" }),
  pagu: z.number({ required_error: "wajib isi" }),
})

const AddEditModal = ({
  isOpen,
  onClose,
  item,
  refetch,
  refetchSub,
  data,
}: AddEditModalProps) => {
  const { mutateAsync: add, isLoading: isAddLoading } = api.pembangunan.addSubkegiatan.useMutation()
  const { mutateAsync: update, isLoading: isUpdateLoading } = api.pembangunan.updateSubkegiatan.useMutation()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),

  })

  const isEditMode = item !== null;

  const handleSave = async (values: z.infer<typeof formSchema>) => {
    console.log("mulai")
    if (isEditMode) {
      console.log("edit")
      try {
        const result = await update({ id: item.id, dpaId: data.dpaId, ...values })
        if (result.ok) {
          refetch()
          refetchSub()
          form.reset()
          onClose();
        }
      } catch (error) {
        console.log("error", error)
      }
    } else {
      console.log("add")
      try {
        const result = await add({ dpaId: data.dpaId, ...values })
        if (result.ok) {
          refetch()
          refetchSub()
          form.reset()
          onClose();
        }
      } catch (error) {
        console.log("error", error)
      }
    }
  };

  useEffect(() => {
    if (isEditMode) {
      if (item) {
        form.setValue('subKegiatan', item.subKegiatanId)
        form.setValue('sumberDana', item.sumberDanaId)
        form.setValue('pagu', item.pagu)
      }
    } else {
      form.reset()
    }

  }, [isEditMode, item, form])

  const buttonText = () => {
    if (isAddLoading || isUpdateLoading) {
      return "Loading"
    } else {
      return isEditMode ? "Simpan" : "Tambah"
    }
  }

  return (
    <AlertDialog open={isOpen}>
      <AlertDialogContent className="min-w-[60%]">
        <AlertDialogHeader>
          <AlertDialogTitle>{isEditMode ? 'Ubah Sub Kegiatan' : 'Tambah Sub Kegiatan'}</AlertDialogTitle>
        </AlertDialogHeader>
        <div>
          <Form {...form}>
            <form className="">
              <div className="space-y-4">
                <SearchSelect
                  data={data?.subKegiatan}
                  form={form}
                  label="Sub Kegiatan"
                  name="subKegiatan"
                  placeholder="Pilih Sub Kegiatan"
                />

                <SearchSelect
                  data={data?.sumberDana}
                  form={form}
                  label="Sumber Dana"
                  name="sumberDana"
                  placeholder="Pilih Sumber Dana"
                />
                <MoneyInput
                  className="flex-1"
                  form={form}
                  label="Total Pagu"
                  name="pagu"
                  placeholder="Rp 0"
                />
              </div>
            </form>
          </Form>
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onClose}>Cancel</AlertDialogCancel>
          <AlertDialogAction disabled={isAddLoading || isUpdateLoading} onClick={form.handleSubmit(handleSave)}>{buttonText()}</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

const SubKegiatan = () => {
  const router = useRouter()
  const id = router.query.slug![0]!
  const [modalState, setModalState] = useState({ isOpen: false, item: null })
  const { data, refetch } = api.pembangunan.get.useQuery({ id })
  const { mutateAsync: deleteAsync } = api.pembangunan.deleteSubKegiatan.useMutation()
  const [kegiatanId, setKegiatanId] = useState('');
  const [deleteModal, setDeleteModal] = useState<null | string>(null)

  useEffect(() => {
    if (data && data.dpa && data.dpa.kegiatanId) {
      setKegiatanId(data.dpa.kegiatanId);
    }
  }, [data]);

  const { data: sub, refetch: refetchSub } = api.pembangunan.getSubKegiatan.useQuery({ id, kegiatanId }, {
    enabled: !!kegiatanId,
  });

  // ------ Add & Edit --------

  const handleOpenAddModal = () => {
    setModalState({ isOpen: true, item: null }); // Open modal in add mode
  };

  const handleOpenEditModal = (item: any) => {
    setModalState({ isOpen: true, item: item.original }); // Open modal in edit mode with the item
  };

  const handleCloseModal = () => {
    setModalState({ isOpen: false, item: null }); // Close modal and reset item
  };

  // ------ Delete --------

  const handleDeleteModalOpen = (data: any) => {
    setDeleteModal(data.original.id)
  }
  const handleDeleteModalClose = () => {
    setDeleteModal(null)
  }
  const handleDeleteSubmit = async () => {
    try {
      const result = await deleteAsync({ id: deleteModal as string })
      if (result.ok) {
        refetchSub()
        refetch()
        handleDeleteModalClose()
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
        <MultiStep data={pembangunanStep} type="pembangunan" onNext={() => {
          router.push(`/pembangunan/dpa/${id}/result`)
        }} >
          <div className="my-5">
            <p className="text-sm">Informasi DPA</p>
            <div className="border rounded-md p-4 my-2">
              <div className="flex justify-between ">
                <div>
                  <p>DPA: {data?.dpa?.no}</p>
                  <p>OPD: {data?.dpa?.Dinas.name}</p>
                  <p>Tahun: {data?.dpa?.createdAt.getFullYear()}</p>
                </div>
                <div>

                  <p>Alokasi: Rp {data?.dpa?.jumlahAlokasi?.toLocaleString('id-ID')}</p>
                  <p>Ter Alokasi: Rp {data?.dpa?.teralokasi?.toLocaleString('id-ID')}</p>
                  <p>Sisa Alokasi: Rp {data?.dpa?.sisaAlokasi?.toLocaleString('id-ID')}</p>
                </div>
              </div>
              <Separator className="my-4" />
              <div className="flex flex-col p-2">
                <p className="text-xs font-bold">
                  - Urusan: <span className="italic">{data?.rincian.urusan?.kode} | {data?.rincian.urusan?.name}</span>
                </p>
                <p className="text-xs font-bold ml-2">
                  - Bidang: <span className="italic">{data?.rincian.bidang?.kode} | {data?.rincian.bidang?.name}</span>
                </p>
                <p className="text-xs font-bold ml-4">
                  - Program: <span className="italic">{data?.rincian.program?.kode} | {data?.rincian.program?.name}</span>
                </p>
                <p className="text-xs font-bold ml-6">
                  - Kegiatan: <span className="italic">{data?.rincian.kegiatan?.kode} | {data?.rincian.kegiatan?.name}</span>
                </p>
                <p className="text-xs font-bold ml-4">
                  - Organisasi: <span className="italic">{data?.rincian.organisasi?.kode} | {data?.rincian.organisasi?.name}</span>
                </p>
                <p className="text-xs font-bold ml-6">
                  - Unit: <span className="italic">{data?.rincian.unit?.kode} | {data?.rincian.unit?.name}</span>
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
                  {
                    id: "actions",
                    header: () => "Aksi",
                    meta: {
                      align: 'right'
                    },
                    cell: ({ row }: { row: any }) => (
                      <DataTableRowActions
                        row={row}
                        onDeleteClick={handleDeleteModalOpen}
                        onEditClick={handleOpenEditModal}
                      />
                    ),
                  }
                ]}
                filterBy="name"
                option={
                  <Button onClick={handleOpenAddModal}>Tambah</Button>
                }
              />
              <DeleteModal
                open={deleteModal}
                onSubmit={handleDeleteSubmit}
                onClose={handleDeleteModalClose}
              />
              <AddEditModal
                isOpen={modalState.isOpen}
                onClose={handleCloseModal}
                item={modalState.item}
                refetch={refetch}
                refetchSub={refetchSub}
                data={{ dpaId: id, subKegiatan: sub?.subKegiatan, sumberDana: sub?.sumberDana }}
              />
            </div>
          </div>
        </MultiStep>
      </div>
    </Layout>
  )
}

export default SubKegiatan
