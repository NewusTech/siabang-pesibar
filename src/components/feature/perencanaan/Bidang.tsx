import { createColumnHelper } from "@tanstack/react-table"
import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import Link from "next/link"
import { DeleteModal } from "~/components/DeleteModal"
import { DataTable } from "~/components/feature/table/data-table"
import { DataTableRowActions } from "~/components/feature/table/table-row-action"
import { Layout } from "~/components/layout"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "~/components/ui/alert-dialog"
import { Button } from "~/components/ui/button"
import { api } from "~/utils/api"
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
import Breadcrumbs from "~/components/BreadCrumbs"
import { useRouter } from "next/router"

const formSchema = z.object({
  name: z.string().min(2, {
    message: "name must be at least 2 characters.",
  }),
  kode: z.string().min(2, {
    message: "kode must be at least 2 characters.",
  }),
  urusanId: z.string()
})

interface AddEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  item?: any; // You might want to replace any with a more specific type
  refetch: any;
  router: any;
}

type Bidang = {
  id: string
  name: string
  action: string
}

const columnHelper = createColumnHelper<Bidang>()

const columns = [
  columnHelper.accessor('name', {
    header: () => 'Nomenklatur',
    cell: info => info.getValue(),
  }),
]

const AddEditModal = ({
  isOpen,
  onClose,
  item,
  refetch,
  router
}: AddEditModalProps) => {
  const { mutateAsync, isLoading } = api.bidang.add.useMutation()
  const { mutateAsync: update, isLoading: isUpdateLoading } = api.bidang.update.useMutation()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      kode: '',
      urusanId: ''
    },
  })

  const isEditMode = item !== null;

  const handleSave = async (values: z.infer<typeof formSchema>) => {
    if (isEditMode) {
      try {
        const result = await update({ id: item.id, name: values.name, kode: values.kode, urusanId: router[0] })
        if (result.ok) {
          refetch()
          form.reset()
          onClose();
        }
      } catch (error) {
        console.log("error", error)
      }
    } else {
      try {
        const result = await mutateAsync({ name: values.name, kode: values.kode, urusanId: router[0] })
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
        form.setValue('name', item.name)
        form.setValue('kode', item.kode)
        form.setValue('urusanId', item.urusanId)
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
          <AlertDialogTitle>{isEditMode ? 'Ubah Bidang' : 'Tambah Bidang'}</AlertDialogTitle>
        </AlertDialogHeader>
        <div>
          <Form {...form}>
            <form className="space-y-8">
            <FormField
                control={form.control}
                name="kode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Kode</FormLabel>
                    <FormControl>
                      <Input placeholder="Masukkan kode" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nomenklatur</FormLabel>
                    <FormControl>
                      <Input placeholder="Masukkan Nomenklatur" {...field} />
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

const Bidang = () => {
  const router = useRouter()
  const slug = router.query.slug as string[]
  const [modalState, setModalState] = useState({ isOpen: false, item: null, router: slug })
  const [deleteModal, setDeleteModal] = useState<null | string>(null)
  const { data, refetch } = api.bidang.get.useQuery({ urusanId: slug[0]})
  const { mutateAsync, isLoading } = api.bidang.delete.useMutation()

  // ------ Add & Edit --------

  const handleOpenAddModal = () => {
    setModalState({ isOpen: true, item: null, router: slug }); // Open modal in add mode
  };

  const handleOpenEditModal = (item: any) => {
    setModalState({ isOpen: true, item: item.original, router: slug }); // Open modal in edit mode with the item
  };

  const handleCloseModal = () => {
    setModalState({ isOpen: false, item: null, router: slug }); // Close modal and reset item
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
          <Breadcrumbs data={[{ name: "Urusan", link: "/master/perencanaan" }, { name: "Bidang" }]} />
          <p className="font-semibold">List Bidang</p>
        </div>
        <DataTable
          data={!data ? [] : data}
          columns={[
            {
                id: 'kode',
                header: () => 'KODE',
                cell: ({ row }: { row: any }) => (
                  <Link href={`${router.asPath}/${row.original.id}`} className="text-blue-500 hover:underline">
                    {row.original.kode}
                  </Link>
                ),
              },
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
          filterBy="name"
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
        router= {slug}
      />
    </Layout>
  )
}

export default Bidang