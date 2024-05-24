/* eslint-disable @next/next/no-img-element */
import { Button } from "~/components/ui/button"
import { Separator } from "~/components/ui/separator"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "~/components/ui/alert-dialog"
import { useForm } from "react-hook-form"
import { useCallback, useEffect, useState } from "react"
import { useDropzone } from "react-dropzone";
import { cn } from "~/lib/utils"
import useSWRMutation from 'swr/mutation'
import { Gallery } from "react-grid-gallery";
import { api } from "~/utils/api"
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import jsPDF from "jspdf";

// @ts-ignore
interface CustomImage extends Image {
  original: string;
}

async function sendRequest(url: string, { arg }: { arg: FormData }) {
  return fetch(url, {
    method: 'POST',
    body: arg
  }).then(res => res.json())
}

type ModalProps = {
  id: string
  refetch: any
}

const ModalUpload = ({ id, refetch }: ModalProps) => {
  const [isOpen, setOpen] = useState(false)
  const { trigger, isMutating } = useSWRMutation('/api/upload', sendRequest, /* options */)

  const { register, unregister, setValue, watch, handleSubmit } = useForm();

  const files = watch('files');

  const onDrop = useCallback(
    (droppedFiles: any) => {
      let newFiles = [...(files || []), ...droppedFiles]

      newFiles = newFiles.reduce((prev, file) => {
        const fo = Object.entries(file);
        if (
          prev.find((e: any) => {
            const eo = Object.entries(e);
            return eo.every(
              ([key, value], index) =>
                // @ts-ignore
                key === fo[index][0] && value === fo[index][1]
            );
          })
        ) {
          return prev;
        } else {
          return [...prev, file];
        }
      }, []);

      setValue('files', newFiles, { shouldValidate: true });
    },
    [setValue, files]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': [],
      'image/png': [],
      'image/webp': [],
      'image/heic': [],
      'image/jfif': [],
    },
  });

  useEffect(() => {
    register('files');
    return () => {
      unregister('files');
    };
  }, [register, unregister]);

  const onSubmit = async (values: any) => {
    const formData = new FormData()
    formData.append("id", id)
    values.files.forEach((file: any) => formData.append("media", file));

    try {

      const result = await trigger(formData, /* options */)
      console.log("result", result)
      refetch()
      setOpen(false)

    } catch (e) {
      // error handling
    }
  }

  return (
    <AlertDialog open={isOpen}>
      <AlertDialogTrigger asChild>
        <Button onClick={() => setOpen(true)} variant="outline">Upload</Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="text-center">Upload gambar</AlertDialogTitle>
          <AlertDialogDescription>
            <div className="p-4">
              <div {...getRootProps()}>
                <input
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  id={'files'}
                  {...getInputProps()}
                />

                <div
                  className={cn(
                    "w-full p-2 border border-dashed rounded-md",
                    (isDragActive ? "bg-gray-400" : "bg-white")
                  )
                  }
                >
                  <p className="text-center my-2">Drop the files here ...</p>

                </div>
              </div>
              {!!files?.length && (
                <div className="grid gap-1 grid-cols-4 mt-2">
                  {files.map((file: any) => {
                    return (
                      <div key={file.name}>

                        <img
                          src={URL.createObjectURL(file)}
                          alt={file.name}
                          style={{ width: "100px", }}
                        />
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => setOpen(false)}>Batal</AlertDialogCancel>
          <AlertDialogAction disabled={isMutating} onClick={handleSubmit(onSubmit)}>{isMutating ? "Loading" : "Upload"}</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog >
  )
}

type Props = {
  id: string
}

// nanti ya
// function getImgSize(imgSrc) {
//   var newImg = new Image();

//   newImg.onload = function() {
//     var height = newImg.height;
//     var width = newImg.width;
//     alert ('The image size is '+width+'*'+height);
//   }

//   newImg.src = imgSrc; // this must be done AFTER setting onload
// }

type DeleteProps = {
  open: boolean
  onSubmit: () => {}
  onClose: () => void
  count: number
  isLoading: boolean
}

function DeleteModal({ open, onSubmit, onClose, count, isLoading }: DeleteProps) {
  return (
    <AlertDialog open={open} >
      <AlertDialogContent >
        <AlertDialogHeader>
          <AlertDialogTitle>Apakah kamu yakin menghapus {count} gambar ini?</AlertDialogTitle>
          <AlertDialogDescription>
            Tindakan ini akan membuat data hilang permanen dan akan di hapus di server
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter >
          <AlertDialogCancel onClick={onClose}>Batal</AlertDialogCancel>
          <AlertDialogAction disabled={isLoading} onClick={onSubmit}>{isLoading ? 'Loading ...' : 'Ya, Hapus'}</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

type Data = {
  id: string
  src: string
  width: number
  height: number
  isSelected: boolean
  original: string
}

const Dokumentasi = ({ id }: Props) => {
  const { data, refetch } = api.monitoring.getGallery.useQuery({ id })
  const { mutateAsync, isLoading } = api.monitoring.deleteGalleries.useMutation()
  const [images, setImages] = useState<Data[]>([])
  const [deleteItem, setDelete] = useState<string[]>([])
  const [index, setIndex] = useState(-1);


  const handleClick = (index: number, item: CustomImage) => setIndex(index);


  useEffect(() => {
    if (data) {
      const newData = data.map((v) => ({
        id: v.id,
        src: `${window.location.origin}/dokumentasi/${v.url}`,
        original: `${window.location.origin}/dokumentasi/${v.url}`,
        width: 300,
        height: 300,
        isSelected: false,
      }))
      setImages(newData)
    }
  }, [data, refetch])

  const handleSelect = (index: number) => {
    const nextImages = images.map((image, i) =>
      i === index ? { ...image, isSelected: !image.isSelected } : image
    );
    setImages(nextImages);
  };

  const handleDeleteSubmit = async () => {
    const ids = images.filter((v) => v.isSelected).map((v) => v.id)

    try {
      await mutateAsync({ ids })
      refetch()
      handleDeleteModalClose()
    } catch (error) {
      console.log("error", error)
    }
  }

  const handleDeleteModalClose = () => {
    setDelete([])
  }

  const countDelete = images.filter((v) => v.isSelected === true).length

  const handleOpenDelete = () => {
    setDelete(images.filter((v) => v.isSelected).map((v) => v.id))
  }

  const handlePrint = () => {
    if (!images) return; // Handle case where data hasn't been fetched yet

    const doc = new jsPDF();

    // Header
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);

    // Body
    const startX = 10;
    const startY = 20;
    const columnWidth = (doc.internal.pageSize.getWidth() - 20) / 2; // Lebar kolom
    const imageMarginVertical = 5; // Padding atas dan bawah gambar
    const imageSize = 80; // Ukuran gambar

    // Gambar header
    doc.rect(startX, startY, columnWidth * 2, 10, "S");

    const text = "FOTO DOKUMENTASI";
    const pageWidth = doc.internal.pageSize.getWidth();
    const textWidth = doc.getTextWidth(text);

    const x = (pageWidth - textWidth) / 2;

    doc.text(
      text,
      x,
      26,
    );

    // Header untuk dua kolom dengan colspan 2
    doc.setFillColor(255, 255, 255); // Warna latar belakang
    doc.setTextColor(0, 0, 0); // Warna teks

    // Body untuk dua kolom tanpa colspan
    images.forEach((item: any, index) => {
      const rowY = startY + 10 + index * (imageSize + 2 * imageMarginVertical); // Hitung posisi baris dengan padding

      const fileExtension = item.src?.split(".").pop().toLowerCase();
      // Gambar
      const columnX = startX; // Gambar selalu muncul di setiap kolom pertama
      doc.addImage(
        item.src,
        fileExtension,
        65,
        rowY + imageMarginVertical, // Tambahkan padding atas
        imageSize,
        imageSize,
      );

      // Garis tepi
      doc.rect(
        startX,
        rowY,
        columnWidth * 2,
        imageSize + 2 * imageMarginVertical,
        "S",
      );
    });

    doc.save("Data Dokumentasi.pdf");
  };

  return (
    <div className="border rounded-md p-8">
      <div className="flex justify-end">
        <div className="space-x-4">
          {countDelete > 0 && <Button onClick={handleOpenDelete} variant="destructive">Hapus ({countDelete})</Button>}
          <ModalUpload id={id} refetch={refetch} />
        </div>
        <Button variant="outline" className="ml-3" onClick={handlePrint}>
          Print
        </Button>
      </div>
      <Separator className="my-4" />
      {data ?
        data.length > 0 ?
          <Gallery
            images={images}
            onSelect={handleSelect}
            onClick={handleClick}
          />
          : 'kosong'
        : 'loading'}
      <DeleteModal
        open={deleteItem.length > 0}
        onSubmit={handleDeleteSubmit}
        onClose={handleDeleteModalClose}
        count={deleteItem.length}
        isLoading={isLoading}
      />
      <Lightbox
        slides={images.map((v) => ({ src: v.src }))}
        open={index >= 0}
        index={index}
        close={() => setIndex(-1)}
      />

    </div>
  )
}

export default Dokumentasi