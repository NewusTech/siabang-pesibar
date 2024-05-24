import { createColumnHelper } from "@tanstack/react-table"
import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
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
import SearchSelect from "~/components/SearchSelect"

type User = {
  id: string
  name: any
  email: any
  role: string
  action: string
}

const columnHelper = createColumnHelper<User>()

const columns = [
  columnHelper.accessor('name', {
    header: () => 'Nama',
    cell: info => info.getValue(),
  }),
  columnHelper.accessor('email', {
    header: () => 'Email',
    cell: info => info.getValue(),
  }),
  columnHelper.accessor('role', {
    header: () => 'Role',
    cell: info => info.getValue(),
  }),
]

const formSchema = z.object({
  name: z.string().min(2, {
    message: "name must be at least 2 characters.",
  }),
  password: z.string().min(2, {
    message: "password must be at least 2 characters.",
  }),
  email: z.string().min(2, {
    message: "email must be at least 2 characters.",
  }),
  role: z.string().min(2, {
    message: "role must be at least 2 characters.",
  }),
  dinasId: z.string()
})

interface AddEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  item?: any; // You might want to replace any with a more specific type
  refetch: any
}

const AddEditModal = ({
  isOpen,
  onClose,
  item,
  refetch
}: AddEditModalProps) => {
  const isEditMode = item !== null;

  // const { data } = api.anggaran.get.useQuery({ })
  const { mutateAsync, isLoading } = api.user.add.useMutation()
  const { mutateAsync: update, isLoading: isUpdateLoading } = api.user.update.useMutation()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      role: '',
      dinasId: ''
    },
  })

  const datarole = [
    {
      label: "admin",
      value: "admin",
    },
    {
      label: "anggaran",
      value: "anggaran",
    },
    {
      label: "pembangunan",
      value: "pembangunan",
    }
  ]

  const { data } = api.dinas.getSelect.useQuery()

  const handleSave = async (values: z.infer<typeof formSchema>) => {
    if (isEditMode) {
      try {
        const result = await update({ id: item.id, name: values.name, email: values.email, password: values.password, role: values.role, dinasId: values.dinasId })
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
        const result = await mutateAsync(values)
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
        form.setValue('password', item.password)
        form.setValue('email', item.email)
        form.setValue('role', item.role)
        form.setValue('dinasId', item.dinasId)
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
          <AlertDialogTitle>{isEditMode ? 'Ubah User' : 'Tambah User'}</AlertDialogTitle>
        </AlertDialogHeader>
        <div>
          <Form {...form}>
            <form className="space-y-8">
              <FormField
                control={form.control}
                name="name"
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
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="Email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {!isEditMode && <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input placeholder="Password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />}
              {!isEditMode &&
                <SearchSelect
                  data={datarole}
                  form={form}
                  label="Pilih Role"
                  name="role"
                  placeholder="Pilih Role "
                />
              }
              {!isEditMode &&
                <SearchSelect
                  data={data}
                  form={form}
                  label="Pilih OPD"
                  name="dinasId"
                  placeholder="Pilih OPD "
                />
              }
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

const Page = () => {
  const [modalState, setModalState] = useState({ isOpen: false, item: null })
  const [deleteModal, setDeleteModal] = useState<null | string>(null)
  const { data, refetch } = api.user.get.useQuery({ id: null })

  // const { data: dinas } = api.user.get.useQuery()
  const { mutateAsync, isLoading } = api.user.delete.useMutation()

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
          <Breadcrumbs data={[{ name: "User" }]} />
          <p className="font-semibold">List User</p>
        </div>
        <DataTable
          data={!data ? [] : data}
          columns={[
            ...columns,
            {
              id: 'dinas',
              header: () => "OPD",
              accessorFn: (row: any) => row?.Dinas?.name
            },
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
      />
    </Layout>
  )
}

export default Page