import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "~/components/ui/alert-dialog"

type Props = {
  open: string | null
  onSubmit: () => void
  onClose: () => void
}

export function DeleteModal({ open, onSubmit, onClose }: Props) {
  return (
    <AlertDialog open={!!open} >
      <AlertDialogContent >
        <AlertDialogHeader>
          <AlertDialogTitle>Apakah kamu yakin menghapus ini?</AlertDialogTitle>
          <AlertDialogDescription>
            Tindakan ini akan membuat data hilang permanen dan akan di hapus di server
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter >
          <AlertDialogCancel onClick={onClose}>Batal</AlertDialogCancel>
          <AlertDialogAction onClick={onSubmit}>Ya, Hapus</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
