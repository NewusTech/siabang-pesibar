import { useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { DataTable } from "~/components/feature/table/data-table"
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
import Link from "next/link"
import SearchSelect from "~/components/SearchSelect"
import MoneyInput from "~/components/MoneyInput"
import { useSession } from "next-auth/react"


const formSchema = z.object({
  dinas: z.string().min(0, {
    message: "name must be at least 2 characters.",
  }),
  namaPekerjaan: z.string().min(2, {
    message: "nama pekerjaan must be at least 2 characters.",
  }),
  pelaksanaKontrak: z.string().min(2, {
    message: "name must be at least 2 characters.",
  }),
  subKegiatanId: z.string().min(2, {
    message: "name must be at least 2 characters.",
  }),
  nilaiKontrak: z.number(),
})

interface AddEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  refetch: any,
  dinasId: string | undefined
}

const AddEditModal = ({
  isOpen,
  onClose,
  refetch,
  dinasId
}: AddEditModalProps) => {
  const { data: dinas } = api.dinas.getSelect.useQuery()
  const { mutateAsync, isLoading } = api.monitoring.add.useMutation()
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      dinas: dinasId,
      namaPekerjaan: '',
      pelaksanaKontrak: '',
      subKegiatanId: '',
      nilaiKontrak: 0,
    },
  })
  const { data: subKegiatan, } = api.subKegiatan.getSelectByAnggaran.useQuery({ dinasId: form.watch('dinas') })

  const handleSave = async (values: z.infer<typeof formSchema>) => {

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

  return (
    <AlertDialog open={isOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Tambah</AlertDialogTitle>
        </AlertDialogHeader>
        <div>
          <Form {...form}>
            <form className="space-y-4">
              {dinas && <SearchSelect
                data={dinas}
                form={form}
                label="Pilih OPD"
                name="dinas"
                placeholder="Pilih OPD"
              />}
              <SearchSelect
                data={subKegiatan}
                form={form}
                label="Sub Kegiatan"
                name="subKegiatanId"
                placeholder="Sub Kegiatan"
              />
              <FormField
                control={form.control}
                name="namaPekerjaan"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nama Pekerjaan</FormLabel>
                    <FormControl>
                      <Input placeholder="Nama Pekerjaan" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="pelaksanaKontrak"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Pelaksana Kontrak</FormLabel>
                    <FormControl>
                      <Input placeholder="Pelaksana Kontrak" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <MoneyInput
                className="flex-1"
                form={form}
                label="Nilai Kontrak"
                name="nilaiKontrak"
                placeholder="Rp 0"
              />
            </form>
          </Form>
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onClose}>Cancel</AlertDialogCancel>
          <AlertDialogAction disabled={isLoading} onClick={form.handleSubmit(handleSave)}>Tambah</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

const Page = () => {
  const { data: session } = useSession()
  const dinasId = session?.user.dinas.id
  const [modalState, setModalState] = useState({ isOpen: false, item: null })
  const { data, refetch } = api.monitoring.get.useQuery()

  // ------ Add & Edit --------

  const handleOpenAddModal = () => {
    setModalState({ isOpen: true, item: null }); // Open modal in add mode
  };

  const handleCloseModal = () => {
    setModalState({ isOpen: false, item: null }); // Close modal and reset item
  };

  return (
    <Layout>
      <div className="container mx-auto mt-12">
        <div className="mb-5 space-y-1">
          <Breadcrumbs data={[{ name: "Pembangunan" }, { name: 'Monitoring' }]} />
          <p className="font-semibold">Monitoring</p>
        </div>
        <DataTable
          data={!data ? [] : data}
          columns={[
            {
              id: 'no',
              header: () => 'No',
              cell: ({ row }) => (
                row.index + 1
              )
            },
            {
              id: 'instansi',
              header: () => 'Instansi',
              cell: ({ row }) => row.original.instansi
            },
            {
              id: 'namaPekerjaan',
              header: () => 'Nama Pekerjaan',
              cell: ({ row }) => row.original.namaPekerjaan
            },
            {
              id: 'progress',
              header: () => 'Progress',
              cell: ({ row }) => row.original.progres
            },
            {
              id: 'pelaksanaKontrak',
              header: () => 'Pelaksana Kontrak',
              cell: ({ row }) => row.original.pelaksanaKontrak
            },
            {
              id: "actions",
              header: () => "Aksi",
              cell: (info) => {
                return (
                  <Link href={`/pembangunan/monitoring/${info.row.original.id}`}>
                    <Button>Detail</Button>
                  </Link>
                )
              },
            }
          ]}
          filterBy="instansi"
          option={
            <Button onClick={handleOpenAddModal}>Tambah</Button>
          }
        />
      </div>
      <AddEditModal
        dinasId={dinasId}
        isOpen={modalState.isOpen}
        onClose={handleCloseModal}
        refetch={refetch}
      />
    </Layout>
  )
}

export default Page