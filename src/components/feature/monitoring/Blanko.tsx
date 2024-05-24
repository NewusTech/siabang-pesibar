import { DotsHorizontalIcon } from "@radix-ui/react-icons";
// import { Trash } from "lucide-react"
import { useEffect, useState } from "react";
import { DeleteModal } from "~/components/DeleteModal";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "~/components/ui/alert-dialog";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
// import { Separator } from "~/components/ui/separator"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { cn } from "~/lib/utils";
import { api } from "~/utils/api";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

type CatRowActionProps = {
  handleAddClick: () => void;
  handleDeleteClick: () => void;
};

const CatRowAction = ({
  handleDeleteClick,
  handleAddClick,
}: CatRowActionProps) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="flex h-8 w-8 p-0 data-[state=open]:bg-muted"
        >
          <DotsHorizontalIcon className="h-4 w-4" />
          <span className="sr-only">Open menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[160px]">
        <DropdownMenuItem onClick={handleAddClick}>Tambah</DropdownMenuItem>
        {/* TODO: Edit */}
        <DropdownMenuItem onClick={handleDeleteClick}>Hapus</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

type SubRowActionProps = {
  handleEditClick: () => void;
  handleDeleteClick: () => void;
};

const SubRowAction = ({
  handleDeleteClick,
  handleEditClick,
}: SubRowActionProps) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="flex h-8 w-8 p-0 data-[state=open]:bg-muted"
        >
          <DotsHorizontalIcon className="h-4 w-4" />
          <span className="sr-only">Open menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[160px]">
        <DropdownMenuItem onClick={handleEditClick}>Ubah</DropdownMenuItem>
        <DropdownMenuItem onClick={handleDeleteClick}>Hapus</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

type AddUraianModalProps = {
  isOpen: boolean;
  onClose: () => void;
  refetch: any;
  monitoringId: string;
};

const AddUraianModal = ({
  isOpen,
  onClose,
  refetch,
  monitoringId,
}: AddUraianModalProps) => {
  const [nama, setNama] = useState("");
  const { mutateAsync, isLoading } =
    api.monitoring.addBlankoKategori.useMutation();

  const handleSubmit = async () => {
    try {
      await mutateAsync({ nama, monitoringId });
      refetch();
      onClose();
    } catch (error) {
      console.log("error");
    }
  };

  const handleNameChange = (e: any) => {
    setNama(e.target.value);
  };

  return (
    <AlertDialog open={isOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Tambah Uraian Pekerjaan</AlertDialogTitle>
        </AlertDialogHeader>
        <div className="space-y-4">
          <Label>Uraian Pekerjaan</Label>
          <Input value={nama} onChange={handleNameChange} />
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onClose}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            disabled={isLoading || !nama}
            onClick={handleSubmit}
          >
            {isLoading ? "Loading ..." : "Tambah"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

type CurrentItem = {
  id: string;
  name: string;
  vol: string;
  satuan: string;
  harga: string;
};

type Props = {
  id: string;
};

const Blanko = ({ id }: Props) => {
  const { data: result, refetch } = api.monitoring.getBlanko.useQuery({
    monitoringId: id,
  });
  const { data: dataUmum } = api.monitoring.getUmumById.useQuery({ id });
  const [isEdit, setEdit] = useState<{ id: string | number } | undefined>();
  const [data, setData] = useState<any[]>([]);
  const [newDataIdToEdit, setNewDataIdToEdit] = useState<number | undefined>();
  const [prevDataCount, setPrevDataCount] = useState<number | undefined>();
  const { mutateAsync } = api.monitoring.addBlanko.useMutation();
  const { mutateAsync: deleteAsync } =
    api.monitoring.deleteBlanko.useMutation();
  const [deleteModal, setDeleteModal] = useState<null | any>(null);
  const [addModalOpen, setAddModalOpen] = useState(false);

  const handleEditClick = (v: CurrentItem) => () => {
    if (newDataIdToEdit) {
      setData((currentData) =>
        currentData.filter((item) => item.id !== newDataIdToEdit),
      );
      setNewDataIdToEdit(undefined);
    }
    setEdit(v);
  };

  const handleSave = async () => {
    if (newDataIdToEdit) {
      const res = data.find((v) => v.id === newDataIdToEdit);

      await mutateAsync({
        harga: Number(res.harga),
        kategoriId: res.kategoriId,
        monitoringId: id,
        pekerjaan: res.name,
        satuan: res.satuan,
        volume: Number(res.vol),
        type: "add",
        id: "anjing",
      });
      refetch();
    } else {
      const res = data.find((v) => v.id === isEdit!.id);

      await mutateAsync({
        harga: Number(res.harga),
        kategoriId: res.kategoriId,
        monitoringId: id,
        pekerjaan: res.name,
        satuan: res.satuan,
        volume: Number(res.vol),
        type: "anjing",
        id: res.id,
      });
      refetch();
    }
    setEdit(undefined);
  };

  useEffect(() => {
    if (result) {
      setData(result);
      setPrevDataCount(result.length);
    }
  }, [result]);

  useEffect(() => {
    if (data) {
      if (data.length !== 0 && data.length !== prevDataCount) {
        const res = data.find((v) => v.id === newDataIdToEdit);
        setEdit(res);
      }
    }
  }, [data, newDataIdToEdit, prevDataCount]);

  const onChange = (id: string | number, key: string) => (e: any) => {
    const newData = e.target.value;

    setData((currentData) =>
      currentData.map((item) =>
        item.id === id ? { ...item, [key]: newData } : item,
      ),
    );
  };

  const addNewItemToKategori = (item: any) => () => {
    const theId = Math.random();
    setData((currentData) => {
      const isEmptySub =
        currentData.filter(
          (v) => v.kategoriId === item.id && v.type !== "empty",
        ).length === 0;

      if (isEmptySub) {
        const index = currentData.findIndex((v) => v.id === item.id);
        return [
          ...currentData.slice(0, index + 1),
          {
            type: "sub",
            no: 1,
            id: theId,
            name: "",
            vol: "",
            satuan: "",
            harga: "",
            total: 0,
            kategoriId: item.id,
          },
          ...currentData.slice(index + 1),
        ];
      }

      const newThings = currentData
        .filter((v) => v.kategoriId === item.id)
        .filter((v) => v.type === "sub");
      const last = newThings[newThings.length - 1].id;

      const theIndex = currentData.findIndex((v) => v.id === last);

      return [
        ...currentData.slice(0, theIndex + 1),
        {
          type: "sub",
          no: newThings.length + 1,
          id: theId,
          name: "",
          vol: "",
          satuan: "",
          harga: "",
          total: 0,
          kategoriId: item.id,
        },
        ...currentData.slice(theIndex + 1),
      ];
    });
    setNewDataIdToEdit(theId);
  };

  // ------ Add -----------
  const handleOpenAddModal = () => {
    setAddModalOpen(true);
  };

  const handleAddModalClose = () => {
    setAddModalOpen(false);
  };

  // ------ Delete --------

  const handleDeleteModalOpen = (data: any) => () => {
    setDeleteModal(data);
  };
  const handleDeleteModalClose = () => {
    setDeleteModal(null);
  };
  const handleDeleteSubmit = async () => {
    try {

      const result = await deleteAsync({
        id: deleteModal?.id as string,
        type: deleteModal?.type,
      });
      if (result.ok) {
        refetch();
        handleDeleteModalClose();
      }
    } catch (error) {
      console.log("error", error);
    }
  };

  const handlePrint = () => {
    if (!data) return; // Handle case where data hasn't been fetched yet

    const formatDate = (date: Date): string => {
      const options: Intl.DateTimeFormatOptions = {
        day: "2-digit",
        month: "long",
        year: "numeric",
      };

      return new Intl.DateTimeFormat("id-ID", options).format(date);
    };

    const calculateDateDifference = (
      startDate: Date,
      endDate: Date,
    ): number => {
      const differenceInTime = endDate.getTime() - startDate.getTime();

      const differenceInDays = Math.ceil(differenceInTime / (1000 * 3600 * 24));

      return differenceInDays;
    };

    const formatCurrency = (value: any): any => {
      return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(value);
    };

    const doc = new jsPDF();
    // Header kolom

    const tableData: any[] = [];

    data.forEach((item) => {
      // Memasukkan data ke dalam array sesuai dengan urutan kolom
      const rowData = [
        {
          content: item.type === "empty" ? "" : item.no,
          styles: {
            halign: "left",
            fillColor: "#fff",
            fontStyle: `${item.type === "cat" ? "bold" : "normal"}`,
            textColor: [0, 0, 0],
            fontSize: 8,
            lineWidth: 0.1,
            lineColor: [0, 0, 0],
          },
        }, // Sel pertama
        {
          content: item.type === "empty" ? "" : item.name,
          styles: {
            halign: "left",
            fillColor: "#fff",
            fontStyle: `${item.type === "cat" ? "bold" : "normal"}`,
            textColor: [0, 0, 0],
            fontSize: 8,
            lineWidth: 0.1,
            lineColor: [0, 0, 0],
          },
        },
        {
          content: item.type === "empty" ? "" : item.vol,
          styles: {
            halign: "left",
            fillColor: "#fff",
            fontStyle: `${item.type === "cat" ? "bold" : "normal"}`,
            textColor: [0, 0, 0],
            fontSize: 8,
            lineWidth: 0.1,
            lineColor: [0, 0, 0],
          },
        },
        {
          content: item.type === "empty" ? "" : item.satuan,
          styles: {
            halign: "right",
            fillColor: "#fff",
            fontStyle: `${item.type === "cat" ? "bold" : "normal"}`,
            textColor: [0, 0, 0],
            fontSize: 8,
            lineWidth: 0.1,
            lineColor: [0, 0, 0],
          },
        },
        {
          content: `${item.type === "cat" || item.type === "empty" ? "" : `Rp${Number(item.harga).toLocaleString("id-ID")}`}`,
          styles: {
            halign: "right",
            fillColor: "#fff",
            fontStyle: `${item.type === "cat" ? "bold" : "normal"}`,
            textColor: [0, 0, 0],
            fontSize: 8,
            lineWidth: 0.1,
            lineColor: [0, 0, 0],
          },
        },
        {
          content: "",
          styles: {
            halign: "left",
            fillColor: "#fff",
            fontStyle: `${item.type === "cat" ? "bold" : "normal"}`,
            textColor: [0, 0, 0],
            fontSize: 8,
            lineWidth: 0.1,
            lineColor: [0, 0, 0],
          },
        },
        {
          content: "",
          styles: {
            halign: "left",
            fillColor: "#fff",
            fontStyle: `${item.type === "cat" ? "bold" : "normal"}`,
            textColor: [0, 0, 0],
            fontSize: 8,
            lineWidth: 0.1,
            lineColor: [0, 0, 0],
          },
        },
        {
          content: "",
          styles: {
            halign: "left",
            fillColor: "#fff",
            fontStyle: `${item.type === "cat" ? "bold" : "normal"}`,
            textColor: [0, 0, 0],
            fontSize: 8,
            lineWidth: 0.1,
            lineColor: [0, 0, 0],
          },
        },
        {
          content: "",
          styles: {
            halign: "left",
            fillColor: "#fff",
            fontStyle: `${item.type === "cat" ? "bold" : "normal"}`,
            textColor: [0, 0, 0],
            fontSize: 8,
            lineWidth: 0.1,
            lineColor: [0, 0, 0],
          },
        },
      ];

      // Tambahkan baris ke dalam tabel
      tableData.push(rowData);
    });

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);

    const text = "BLANGKO MONITORING KEGIATAN FISIK";
    const pageWidth = doc.internal.pageSize.getWidth();
    const textWidth = doc.getTextWidth(text);

    const x = (pageWidth - textWidth) / 2;

    doc.text(
      text,
      x,
      10,
    );

    doc.text("1. Umum", 10, 20);
    doc.text("2. Pekerjaaan Yang Terpasang/Riil Dilapangan", 10, 60);

    doc.setFont("helvetica", "normal");
    doc.text("DINAS/OPD : ", 15, 25);
    doc.text("Dinas Pekerjaan Umum dan Penataan Ruang", 37, 25);
    doc.text("Nama PPK : ", 15, 30);
    doc.text(`${dataUmum?.ppk}`, 37, 30);
    doc.text("Pekerjaan : ", 15, 35);
    doc.text(`${dataUmum?.namaPekerjaan}`, 35, 35);
    doc.text("Nilai Kontrak", 15, 40);
    doc.text(`${formatCurrency(dataUmum?.nilaiKontrak)}`, 37, 40);
    doc.text("Pelaksana:", 60, 40);
    doc.text(`${dataUmum?.pelaksanaKontrak}`, 79, 40);
    doc.text("Lokasi: ", 15, 45);
    doc.text(`${dataUmum?.lokasi}`, 27, 45);
    doc.text("Masa Kontrak", 15, 50);
    doc.text(
      `(${dataUmum?.tanggalMulai && dataUmum?.tanggalSelesai && calculateDateDifference(dataUmum?.tanggalMulai, dataUmum?.tanggalSelesai)} Hari Kalender)`,
      38,
      50,
    );
    doc.text("Mulai Tanggal:", 80, 50);
    doc.text(
      `${dataUmum?.tanggalMulai && formatDate(dataUmum?.tanggalMulai)} s/d ${dataUmum?.tanggalSelesai && formatDate(dataUmum?.tanggalSelesai)}`,
      105,
      50,
    );

    // Buat tabel dengan menggunakan autoTable
    autoTable(doc, {
      startY: 63,
      tableLineWidth: 0.1,
      tableLineColor: [0, 0, 0],
      head: [
        // Header dengan satu baris dan dua sel
        [
          {
            content: "NO",
            rowSpan: 2,
            styles: {
              halign: "left",
              valign: "middle",
              fillColor: "#fff",
              textColor: [0, 0, 0],
              fontSize: 8,
              lineWidth: 0.1,
              lineColor: [0, 0, 0],
            },
          }, // Sel pertama
          {
            content: "Uraian Pekerjaan",
            rowSpan: 2,
            styles: {
              halign: "center",
              valign: "middle",
              fillColor: "#fff",
              textColor: [0, 0, 0],
              fontSize: 8,
              lineWidth: 0.1,
              lineColor: [0, 0, 0],
            },
          },
          {
            content: "Volume",
            rowSpan: 2,
            styles: {
              halign: "center",
              valign: "middle",
              fillColor: "#fff",
              textColor: [0, 0, 0],
              fontSize: 8,
              lineWidth: 0.1,
              lineColor: [0, 0, 0],
            },
          },
          {
            content: "Harga Satuan",
            rowSpan: 2,
            styles: {
              halign: "center",
              valign: "middle",
              fillColor: "#fff",
              textColor: [0, 0, 0],
              fontSize: 8,
              lineWidth: 0.1,
              lineColor: [0, 0, 0],
            },
          },
          {
            content: "Total",
            rowSpan: 2,
            styles: {
              halign: "center",
              valign: "middle",
              fillColor: "#fff",
              textColor: [0, 0, 0],
              fontSize: 8,
              lineWidth: 0.1,
              lineColor: [0, 0, 0],
            },
          },
          {
            content: "Persen",
            rowSpan: 2,
            styles: {
              halign: "center",
              valign: "middle",
              fillColor: "#fff",
              textColor: [0, 0, 0],
              fontSize: 8,
              lineWidth: 0.1,
              lineColor: [0, 0, 0],
            },
          },
          {
            content: "Ril",
            colSpan: 2,
            styles: {
              halign: "center",
              fillColor: "#fff",
              textColor: [0, 0, 0],
              fontSize: 8,
              lineWidth: 0.1,
              lineColor: [0, 0, 0],
            },
          },
          {
            content: "Kel",

            styles: {
              halign: "center",
              fillColor: "#fff",
              textColor: [0, 0, 0],
              fontSize: 8,
              lineWidth: 0.1,
              lineColor: [0, 0, 0],
            },
          },
        ],
        [
          {
            content: "Sudah",
            styles: {
              halign: "center",
              fillColor: "#fff",
              textColor: [0, 0, 0],
              fontSize: 8,
              lineWidth: 0.1,
              lineColor: [0, 0, 0],
            },
          },
          {
            content: "Belum",
            styles: {
              halign: "center",
              fillColor: "#fff",
              textColor: [0, 0, 0],
              fontSize: 8,
              lineWidth: 0.1,
              lineColor: [0, 0, 0],
            },
          },
          {
            content: "",

            styles: {
              halign: "center",
              fillColor: "#fff",
              textColor: [0, 0, 0],
              fontSize: 8,
              lineWidth: 0.1,
              lineColor: [0, 0, 0],
            },
          },
        ],
      ],
      body: tableData,
    });

    doc.save("Data Blanko Monitoring.pdf");
  };

  return (
    <div className="border-t py-4">
      <div className="flex justify-end gap-2">
        <Button type="button" onClick={handlePrint}>
          Print
        </Button>
        <Button onClick={handleOpenAddModal}>Tambah</Button>
      </div>
      <div className="mt-4 rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10">No</TableHead>
              <TableHead>Uraian Pekerjaan</TableHead>
              <TableHead>Vol</TableHead>
              <TableHead>Satuan</TableHead>
              <TableHead>Harga</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data && data.length > 1
              ? data.map((v) => (
                  <TableRow key={v.id}>
                    <TableCell
                      className={cn(v.type === "cat" ? "font-semibold" : "")}
                    >
                      {v.no}
                    </TableCell>
                    <TableCell
                      className={cn(v.type === "cat" ? "font-semibold" : "")}
                    >
                      {v.type === "sub" && isEdit?.id === v.id ? (
                        <Input
                          value={v.name}
                          onChange={onChange(v.id, "name")}
                        />
                      ) : (
                        v.name
                      )}
                    </TableCell>
                    <TableCell className="w-[100px]">
                      {v.type === "sub" && isEdit?.id === v.id ? (
                        <div>
                          <Input
                            type="number"
                            value={v.vol}
                            onChange={onChange(v.id, "vol")}
                          />
                        </div>
                      ) : (
                        v.vol
                      )}
                    </TableCell>
                    <TableCell className="w-[100px]">
                      {v.type === "sub" && isEdit?.id === v.id ? (
                        <div>
                          <Input
                            value={v.satuan}
                            onChange={onChange(v.id, "satuan")}
                          />
                        </div>
                      ) : (
                        v.satuan
                      )}
                    </TableCell>
                    <TableCell className="w-[200px]">
                      {v.type === "empty" || v.type === "cat" ? (
                        ""
                      ) : v.type === "sub" && isEdit?.id === v.id ? (
                        <div>
                          <Input
                            type="number"
                            value={v.harga}
                            onChange={onChange(v.id, "harga")}
                          />
                        </div>
                      ) : (
                        `Rp ${Number(v.harga).toLocaleString("id-ID")}`
                      )}
                    </TableCell>
                    <TableCell
                      className={cn(v.type === "cat" ? "font-semibold" : "")}
                    >
                      {v.type === "empty" || v.type === "cat"
                        ? ""
                        : `Rp ${v.total?.toLocaleString("id-ID")}`}
                    </TableCell>
                    <TableCell className="w-[100px]">
                      {v.type === "cat" ? (
                        <CatRowAction
                          handleDeleteClick={handleDeleteModalOpen(v)}
                          handleAddClick={addNewItemToKategori(v)}
                        />
                      ) : v.type === "sub" && isEdit?.id === v.id ? (
                        <Button
                          size="sm"
                          disabled={!v.name || !v.harga || !v.vol || !v.satuan}
                          onClick={handleSave}
                        >
                          Simpan
                        </Button>
                      ) : v.type === "sub" ? (
                        <SubRowAction
                          handleDeleteClick={handleDeleteModalOpen(v)}
                          handleEditClick={handleEditClick(v)}
                        />
                      ) : (
                        ""
                      )}
                    </TableCell>
                  </TableRow>
                ))
              : "Kosong"}
          </TableBody>
        </Table>
        <DeleteModal
          open={deleteModal}
          onSubmit={handleDeleteSubmit}
          onClose={handleDeleteModalClose}
        />

        <AddUraianModal
          isOpen={addModalOpen}
          monitoringId={id}
          onClose={handleAddModalClose}
          refetch={refetch}
        />
      </div>
    </div>
  );
};

export default Blanko;
