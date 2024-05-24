import { useRouter } from "next/router"
import Breadcrumbs from "~/components/BreadCrumbs"
import MultiStep from "~/components/MultiStep"
import dpaMultistep from "~/components/constants/dpa-multistep"
import { Layout } from "~/components/layout"
import { Separator } from "~/components/ui/separator"
import { api } from "~/utils/api"
import { DataTable } from "~/components/feature/table/data-table"
import { DataTableRowActions } from "../table/table-row-action"
import { Button } from "~/components/ui/button"
import { useEffect, useState, useMemo } from "react"
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
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form"
import { Input } from "~/components/ui/input"
import SearchSelect from "~/components/SearchSelect"
import MoneyInput from "~/components/MoneyInput"

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
  lokasi: z.string({ required_error: "wajib isi" }),
  target: z.string({ required_error: "wajib isi" }),
  waktu: z.string({ required_error: "wajib isi" }),
  keterangan: z.string({ required_error: "wajib isi" }),
  operasi: z.number({ required_error: "wajib isi" }),
  modal: z.number({ required_error: "wajib isi" }),
  takTerduga: z.number({ required_error: "wajib isi" }),
  transfer: z.number({ required_error: "wajib isi" }),
})

const AddEditModal = ({
  isOpen,
  onClose,
  item,
  refetch,
  refetchSub,
  data,
}: AddEditModalProps) => {
  const { mutateAsync: add, isLoading: isAddLoading } = api.anggaran.addSubkegiatan.useMutation()
  const { mutateAsync: update, isLoading: isUpdateLoading } = api.anggaran.updateSubkegiatan.useMutation()

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
        console.log(item, "babi")
        form.setValue('modal', item.modal)
        form.setValue('takTerduga', item.takTerduga)
        form.setValue('operasi', item.operasi)
        form.setValue('transfer', item.transfer)
        form.setValue('waktu', item.waktuPelaksanaan)
        form.setValue('keterangan', item.keterangan)
        form.setValue('sumberDana', item.sumberDanaId)
        form.setValue('subKegiatan', item.subKegiatanId)
        form.setValue('lokasi', item.lokasi)
        form.setValue('target', item.target)
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
      <AlertDialogContent className="min-w-[70%]" >
        <AlertDialogHeader>
          <AlertDialogTitle>{isEditMode ? 'Ubah Sub Kegiatan' : 'Tambah Sub Kegiatan'}</AlertDialogTitle>
        </AlertDialogHeader>
        <div>
          <Form {...form}>
            <form className="grid grid-cols-7 gap-4">
              <div className="col-start-1 col-span-4 space-y-4">
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
                <div className="flex space-x-4">
                  <FormField
                    control={form.control}
                    name="lokasi"
                    render={({ field }) => (
                      <FormItem className="w-full">
                        <FormLabel>lokasi</FormLabel>
                        <FormControl>
                          <Input placeholder="Lokasi... " {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="target"
                    render={({ field }) => (
                      <FormItem className="w-full">
                        <FormLabel>Target</FormLabel>
                        <FormControl>
                          <Input placeholder="Target... " {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="flex space-x-4">
                  <FormField
                    control={form.control}
                    name="waktu"
                    render={({ field }) => (
                      <FormItem className="w-full">
                        <FormLabel>Waktu Pelaksanaan</FormLabel>
                        <FormControl>
                          <Input placeholder="Waktu Pelaksanaan... " {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="keterangan"
                    render={({ field }) => (
                      <FormItem className="w-full">
                        <FormLabel>Keterangan</FormLabel>
                        <FormControl>
                          <Input placeholder="Keterangan... " {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
              <div className="col-start-5 col-span-3 ">
                <p className="text-sm pb-1"> Pagu</p>
                <div className="border rounded-xl p-4 space-y-4">
                  <MoneyInput
                    className="flex-1"
                    form={form}
                    label="Belanja Operasi"
                    name="operasi"
                    placeholder="Rp 0"
                  />
                  <MoneyInput
                    className="flex-1"
                    form={form}
                    label="Belanja Modal"
                    name="modal"
                    placeholder="Rp 0"
                  />
                  <MoneyInput
                    className="flex-1"
                    form={form}
                    label="Belanja Tak Terduga"
                    name="takTerduga"
                    placeholder="Rp 0"
                  />
                  <MoneyInput
                    className="flex-1"
                    form={form}
                    label="Belanja Transfer"
                    name="transfer"
                    placeholder="Rp 0"
                  />
                </div>

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
  const { data, refetch } = api.anggaran.get.useQuery({ id })
  const { mutateAsync: deleteAsync } = api.anggaran.deleteSubKegiatan.useMutation()
  const [kegiatanId, setKegiatanId] = useState('');
  const [deleteModal, setDeleteModal] = useState<null | string>(null)

  useEffect(() => {
    if (data && data.dpa && data.dpa.kegiatanId) {
      setKegiatanId(data.dpa.kegiatanId);
    }
  }, [data]);

  const isFormDisabled = useMemo(() => {
    if (!data?.dpa?.dateline) return false
    const today = new Date().setHours(0, 0, 0, 0)
    const dateline = new Date(data.dpa.dateline).setHours(0, 0, 0, 0)
    return dateline < today
  }, [data])

  const { data: sub, refetch: refetchSub } = api.anggaran.getSubKegiatan.useQuery({ id, kegiatanId }, {
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
        <MultiStep data={dpaMultistep} type="anggaran" onNext={() => {
          router.push(`/anggaran/dpa/${id}/rincian/sub-kegiatan/rencana`)
        }} >
          <div className="my-5">
            <p className="text-sm">Informasi DPA</p>
            <div className="border rounded-md p-4 my-2">
              <div className="flex justify-between ">
                <div>
                  <p>DPA: {data?.dpa?.no}</p>
                  <p>Dinas: {data?.dpa?.Dinas.name}</p>
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
                  <Button disabled={isFormDisabled} onClick={handleOpenAddModal}>Tambah</Button>
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
