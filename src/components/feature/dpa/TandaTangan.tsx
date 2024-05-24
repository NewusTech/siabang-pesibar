import { useRouter } from "next/router"
import Breadcrumbs from "~/components/BreadCrumbs"
import MultiStep from "~/components/MultiStep"
import dpaMultistep from "~/components/constants/dpa-multistep"
import { Layout } from "~/components/layout"
import { Separator } from "~/components/ui/separator"
import { api } from "~/utils/api"
import { DataTable } from "../table/data-table"
import { createColumnHelper } from "@tanstack/react-table"
import { DataTableRowActions } from "../table/table-row-action"
import { Button } from "~/components/ui/button"
import { DeleteModal } from "~/components/DeleteModal"
import { useEffect, useState } from "react"
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
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form"
import { Input } from "~/components/ui/input"

type Pengguna = {
  id: string
  nama: string
  nip: string
  jabatan: string
  dpaId: string
  action: string
}

const columnHelper = createColumnHelper<Pengguna>()

const columns = [
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

const formSchema = z.object({
  nama: z.string().min(2, {
    message: "name must be at least 2 characters.",
  }),
  nip: z.string().min(2, {
    message: "name must be at least 2 characters.",
  }),
  jabatan: z.string().min(2, {
    message: "name must be at least 2 characters.",
  }),
})

interface AddEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  item?: any; // You might want to replace any with a more specific type
  refetch: any
  dpaId: string
}

const AddEditModal = ({
  isOpen,
  onClose,
  item,
  refetch,
  dpaId
}: AddEditModalProps) => {
  const { mutateAsync, isLoading } = api.anggaran.addTTd.useMutation()
  const { mutateAsync: update, isLoading: isUpdateLoading } = api.anggaran.updateTtd.useMutation()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nama: '',
      nip: '',
      jabatan: ""
    }
  })

  const isEditMode = item !== null;

  const handleSave = async (values: z.infer<typeof formSchema>) => {
    if (isEditMode) {
      try {
        const result = await update({ id: item.id, ...values, dpaId })
        if (result.ok) {
          refetch()
          form.reset()
          onClose();
        }
      } catch (error) {
        console.log("error", error)
      }
    } else {
      console.log("values", values, dpaId)
      try {
        const result = await mutateAsync({ dpaId, ...values })
        if (result.ok) {
          refetch()
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
        form.setValue('nama', item.nama)
        form.setValue('nip', item.nip)
        form.setValue('jabatan', item.jabatan)
      }
    } else {
      form.reset()
    }

  }, [isEditMode, item, form])

  const buttonText = () => {
    if (isLoading || isUpdateLoading) {
      return "Loading"
    } else {
      return isEditMode ? "Simpan" : "Tambah"
    }
  }

  return (
    <AlertDialog open={isOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{isEditMode ? 'Ubah Pengguna' : 'Tambah Pengguna'}</AlertDialogTitle>
        </AlertDialogHeader>
        <div>
          <Form {...form}>
            <form className="space-y-4">
              <FormField
                control={form.control}
                name="nama"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nama</FormLabel>
                    <FormControl>
                      <Input placeholder="Nama" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="nip"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>NIP</FormLabel>
                    <FormControl>
                      <Input placeholder="NIP" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="jabatan"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Jabatan</FormLabel>
                    <FormControl>
                      <Input placeholder="Jabatan" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </form>
          </Form>
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onClose}>Cancel</AlertDialogCancel>
          <AlertDialogAction disabled={isLoading || isUpdateLoading} onClick={form.handleSubmit(handleSave)}>{buttonText()}</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

const TandaTangan = () => {
  const router = useRouter()
  const id = router.query.slug![0]!

  const [modalState, setModalState] = useState({ isOpen: false, item: null })
  const [deleteModal, setDeleteModal] = useState<null | string>(null)
  const { data: pengguna, refetch } = api.anggaran.getTtd.useQuery({ id })
  const { data: anggaran } = api.anggaran.get.useQuery({ id })
  const { mutateAsync } = api.anggaran.deleteTtd.useMutation()


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
      const result = await mutateAsync({ id: deleteModal as string })
      if (result.ok) {
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
          router.push(`/anggaran/dpa/${id}/result`)
        }} >
          <div className="my-5">
            <p className="text-sm">Informasi DPA</p>
            <div className="border rounded-md p-4 my-2">
              <div className="flex justify-between ">
                <div>
                  <p>DPA: {anggaran?.dpa?.no}</p>
                  <p>Dinas: {anggaran?.dpa?.Dinas.name}</p>
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
            <DataTable
              data={!pengguna ? [] : pengguna}
              columns={[
                ...columns,
                {
                  id: "actions",
                  header: () => "Aksi",
                  cell: ({ row }: { row: any }) => (
                    <DataTableRowActions
                      row={row}
                      onDeleteClick={handleDeleteModalOpen}
                      onEditClick={handleOpenEditModal}
                    />
                  ),
                }
              ]}
              filterBy="nama"
              option={
                <Button onClick={handleOpenAddModal}>Tambah</Button>
              }
            />
          </div>
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
            dpaId={id}
          />

        </MultiStep>
      </div>
    </Layout>
  )
}

export default TandaTangan