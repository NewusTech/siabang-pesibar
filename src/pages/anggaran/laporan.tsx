import { useState, useEffect } from "react";
import Breadcrumbs from "~/components/BreadCrumbs"
import { Layout } from "~/components/layout"
import { api } from "~/utils/api";
import { useSession } from "next-auth/react"
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Button } from "~/components/ui/button"

const Page = () => {
  const session = useSession()
  const isAdmin = session?.data?.user?.role
  const [namaDinas, setnamaDinas] = useState<string>('Semua Perangkat Daerah');
  const [selectedDinas, setSelectedDinas] = useState<string>('');
  const [selectedMonth, setSelectedMonth] = useState<string>('');
  const [selectedYear, setSelectedYear] = useState<string>('');

  const { data: anggarann } = api.anggaran.getanggaran.useQuery({ selectedDinas, selectedMonth, selectedYear });

  const months = [
    { value: '', label: 'Semua Bulan' },
    { value: '1', label: 'Januari' },
    { value: '2', label: 'Februari' },
    { value: '3', label: 'Maret' },
    { value: '4', label: 'April' },
    { value: '5', label: 'Mei' },
    { value: '6', label: 'Juni' },
    { value: '7', label: 'Juli' },
    { value: '8', label: 'Agustus' },
    { value: '9', label: 'September' },
    { value: '10', label: 'Oktober' },
    { value: '11', label: 'November' },
    { value: '12', label: 'Desember' },
  ];

  const handleMonthChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedMonth(event.target.value);
  };

  const years = [
    { value: '', label: 'Semua Tahun' },
    { value: '2021', label: '2021' },
    { value: '2022', label: '2022' },
    { value: '2023', label: '2023' },
    { value: '2024', label: '2024' },
    { value: '2025', label: '2025' },
    { value: '2026', label: '2026' },
  ];

  const handleYearChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedYear(event.target.value);
  };

  const handleDinasChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedText = event?.target?.selectedOptions[0]?.text || 'Semua Perangkat Daerah';
    setnamaDinas(selectedText);
    setSelectedDinas(event.target.value);
  };

  const handlePrint = () => {
    const doc = new jsPDF({
      orientation: "landscape",
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    const fontSize = 10;
    doc.setFontSize(fontSize);

    // Function to center text
    const centerText = (text: any, y: any) => {
      const textWidth = doc.getStringUnitWidth(text) * fontSize / doc.internal.scaleFactor;
      const textX = (pageWidth - textWidth) / 2;
      doc.text(text, textX, y);
    }

    doc.setFontSize(10);

    // Titles
    centerText("Rekapitulasi Laporan Keuangan dan Pencapaian Kinerja", 20);
    centerText(session?.data?.user?.dinas?.name ? session?.data?.user?.dinas?.name : namaDinas, 25);
    centerText(`APBD Kabupaten Pesisir Barat Tahun Anggaran ${selectedYear ? selectedYear : 'Semua Tahun'} ${selectedMonth ? 'Bulan ' + months.find(month => month.value === selectedMonth)?.label : 'Semua Bulan'}`, 30);

    // Add table
    autoTable(doc, {
      startY: 35,
      margin: { bottom: 50 },
      styles: {
        lineWidth: 0.1, // Border width
        lineColor: [0, 0, 0], // Border color
      },
      headStyles: {
        fillColor: [211, 211, 211], // Header background color set to gray
        textColor: [0, 0, 0], // Header text color
        fontSize: 8,
      },
      bodyStyles: {
        fontSize: 8,
      },
      theme: 'grid',
      head: [
        ["Program / Kegiatan / Sub Kegiatan", "Total Anggaran", "Total Realisasi",
          "Belanja Operasi Anggaran", "Belanja Operasi Realisasi",
          "Belanja Modal Anggaran", "Belanja Modal Realisasi",
          "Belanja Tidak Terduga Anggaran", "Belanja Tidak Terduga Realisasi",
          "Belanja Transfer Anggaran", "Belanja Transfer Realisasi"]
      ],
      body: anggarann?.anggaran.map(item => [
        `${item?.Kegiatan?.program?.name} / ${item?.Kegiatan?.name}`,
        `Rp. ${item?.jumlahAlokasi?.toLocaleString('id-ID')}`,
        `Rp. ${item?.teralokasi?.toLocaleString('id-ID')}`,
        `Rp. ${item?.operasi?.toLocaleString('id-ID')}`,
        `Rp. ${item?.oteralokasi?.toLocaleString('id-ID')}`,
        `Rp. ${item?.modal?.toLocaleString('id-ID')}`,
        `Rp. ${item?.mteralokasi?.toLocaleString('id-ID')}`,
        `Rp. ${item?.takTerduga?.toLocaleString('id-ID')}`,
        `Rp. ${item?.ttteralokasi?.toLocaleString('id-ID')}`,
        `Rp. ${item?.transfer?.toLocaleString('id-ID')}`,
        `Rp. ${item?.tteralokasi?.toLocaleString('id-ID')}`,
      ]),
      didDrawPage: (data) => {
        const totalPages = doc.internal.pages.length - 1;
        if (data.pageNumber === totalPages) {
          const signatureY = doc.internal.pageSize.getHeight() - 40; // 30 units from bottom
          doc.setFontSize(10);
          doc.text("Mengetahui,", pageWidth - 100, signatureY);
          doc.text("Kepala Dinas", pageWidth - 100, signatureY + 5);
          doc.text("_____________________", pageWidth - 100, signatureY + 30); // Placeholder for the signature
        }
      }
    });

    doc.save("Laporan.pdf");
  };


  return (
    <Layout>
      <div className="container mx-auto mt-12">
        <div className="mb-5 space-y-1">
          <Breadcrumbs data={[{ name: "Laporan" }]} />
          <p className="font-semibold">Laporan</p>
        </div>
        <div className="flex" style={{ paddingBottom: 10 }}>
          <div className="pr-2">
            <p>Bulan</p>
            <select
              id="bulan"
              name="bulan"
              value={selectedMonth}
              onChange={handleMonthChange}
              className=" rounded-md border border-gray-500 bg-white py-1.5 px-2 text-gray-900 shadow-sm focus:ring-1 focus:ring-inset focus:ring-blue-400 sm:text-sm sm:leading-6"
            >
              {months.map(month => (
                <option key={month.value} value={month.value}>
                  {month.label}
                </option>
              ))}
            </select>
          </div>
          <div className="pr-2">
            <p>Tahun</p>
            <select
              id="tahun"
              name="tahun"
              value={selectedYear}
              onChange={handleYearChange}
              className=" rounded-md border border-gray-500 bg-white py-1.5 px-2 text-gray-900 shadow-sm focus:ring-1 focus:ring-inset focus:ring-blue-400 sm:text-sm sm:leading-6"
            >
              {years.map(year => (
                <option key={year.value} value={year.value}>
                  {year.label}
                </option>
              ))}
            </select>
          </div>
          {isAdmin === 'admin' && <div className="pr-2">
            <p>OPD</p>
            <select
              id="dinas"
              name="dinas"
              value={selectedDinas}
              onChange={handleDinasChange}
              className=" rounded-md border border-gray-500 bg-white py-1.5 px-2 text-gray-900 shadow-sm focus:ring-1 focus:ring-inset focus:ring-blue-400 sm:text-sm sm:leading-6"
            >
              <option value="">Semua</option>
              {anggarann?.dinas.map(dinas => (
                <option key={dinas.value} value={dinas.value}>
                  {dinas.label}
                </option>
              ))}
            </select>
          </div>
          }
        </div>
        <div>
          <p className="font-bold text-md text-black text-center">
            Rekapitulasi Laporan Keuangan dan Pencapaian Kinerja {session?.data?.user?.dinas?.name ? session?.data?.user?.dinas?.name : namaDinas}
          </p>
          <p className="font-bold text-md text-black text-center">
            APBD Kabupaten Pesisir Barat Tahun Anggaran {selectedYear ? 'Tahun' : ''} {selectedYear ? years.find(year => year.value === selectedYear)?.label : 'Semua Tahun'}
          </p>
          <p className="font-bold text-md text-black text-center">
            {selectedMonth ? 'Bulan' : ''} {selectedMonth ? months.find(month => month.value === selectedMonth)?.label : 'Semua Bulan'}
          </p>
        </div>
        <div className="overflow-x-auto">
          <div className="flex my-2">
            <p className="font-normal mt-2 mr-3">Perangkat Daerah:{namaDinas ? ' ' + namaDinas : ' Semua Perangkat Daerah'}</p>
            <Button variant="outline" type="button" onClick={handlePrint}>
              Print
            </Button>
          </div>
          <table style={{ width: "1700px" }} className="table-auto rounded-lg border border-collapse border-gray-400">
            <thead className="bg-blue-600 text-white">
              <tr>
                <th className="border border-gray-400 px-4 py-2 font-normal" rowSpan={3}>Program/Kegiatan/Sub Kegiatan</th>
                <th className="border border-gray-400 px-4 py-2 font-normal" colSpan={15}>Anggaran</th>
              </tr>
              <tr>
                <th className="border border-gray-400 px-4 py-2 font-normal" colSpan={3}>Total</th>
                <th className="border border-gray-400 px-4 py-2 font-normal" colSpan={3}>Belanja Operasi</th>
                <th className="border border-gray-400 px-4 py-2 font-normal" colSpan={3}>Belanja Modal</th>
                <th className="border border-gray-400 px-4 py-2 font-normal" colSpan={3}>Belanja Tidak Terduga</th>
                <th className="border border-gray-400 px-4 py-2 font-normal" colSpan={3}>Belanja Transfer</th>
              </tr>
              <tr>
                <th className="border border-gray-400 px-4 py-2 font-normal">Anggaran</th>
                <th className="border border-gray-400 px-4 py-2 font-normal">Realisasi</th>
                <th className="border border-gray-400 px-4 py-2 font-normal">%</th>
                <th className="border border-gray-400 px-4 py-2 font-normal">Anggaran</th>
                <th className="border border-gray-400 px-4 py-2 font-normal">Realisasi</th>
                <th className="border border-gray-400 px-4 py-2 font-normal">%</th>
                <th className="border border-gray-400 px-4 py-2 font-normal">Anggaran</th>
                <th className="border border-gray-400 px-4 py-2 font-normal">Realisasi</th>
                <th className="border border-gray-400 px-4 py-2 font-normal">%</th>
                <th className="border border-gray-400 px-4 py-2 font-normal">Anggaran</th>
                <th className="border border-gray-400 px-4 py-2 font-normal">Realisasi</th>
                <th className="border border-gray-400 px-4 py-2 font-normal">%</th>
                <th className="border border-gray-400 px-4 py-2 font-normal">Anggaran</th>
                <th className="border border-gray-400 px-4 py-2 font-normal">Realisasi</th>
                <th className="border border-gray-400 px-4 py-2 font-normal">%</th>
              </tr>
            </thead>
            <tbody>
              {/* {} */}
              {anggarann?.anggaran && anggarann?.anggaran.map(item => (
                <tr key={item.id}>
                  <td className="border border-gray-400 px-4 py-2">{item?.Kegiatan?.program?.name} / {item?.Kegiatan?.name}</td>
                  <td className="border border-gray-400 px-4 py-2 text-center">Rp. {item?.jumlahAlokasi?.toLocaleString('id-ID')}</td>
                  <td className="border border-gray-400 px-4 py-2 text-center">Rp. {item?.teralokasi?.toLocaleString('id-ID')}</td>
                  <td className="border border-gray-400 px-4 py-2 text-center">{item?.teralokasi !== null && item?.jumlahAlokasi !== null ? ((item?.teralokasi / item?.jumlahAlokasi) * 100).toFixed(0) + "%" : "0%"} </td>
                  <td className="border border-gray-400 px-4 py-2 text-center">Rp. {item?.operasi?.toLocaleString('id-ID')}</td>
                  <td className="border border-gray-400 px-4 py-2 text-center">Rp. {item?.oteralokasi?.toLocaleString('id-ID')}</td>
                  <td className="border border-gray-400 px-4 py-2 text-center">{item?.oteralokasi !== null && item?.operasi !== null && item?.operasi !== 0 ? ((item?.oteralokasi / item?.operasi) * 100).toFixed(0) + "%" : "0%"}</td>
                  <td className="border border-gray-400 px-4 py-2 text-center">Rp. {item?.modal?.toLocaleString('id-ID')}</td>
                  <td className="border border-gray-400 px-4 py-2 text-center">Rp. {item?.mteralokasi?.toLocaleString('id-ID')}</td>
                  <td className="border border-gray-400 px-4 py-2 text-center">{item?.mteralokasi !== null && item?.modal !== null && item?.modal !== 0 ? ((item?.mteralokasi / item?.modal) * 100).toFixed(0) + "%" : "0%"}</td>
                  <td className="border border-gray-400 px-4 py-2 text-center">Rp. {item?.takTerduga?.toLocaleString('id-ID')}</td>
                  <td className="border border-gray-400 px-4 py-2 text-center">Rp. {item?.ttteralokasi?.toLocaleString('id-ID')}</td>
                  <td className="border border-gray-400 px-4 py-2 text-center">{item?.ttteralokasi !== null && item?.takTerduga !== null && item?.takTerduga !== 0 ? ((item?.ttteralokasi / item?.takTerduga) * 100).toFixed(0) + "%" : "0%"}</td>
                  <td className="border border-gray-400 px-4 py-2 text-center">Rp. {item?.transfer?.toLocaleString('id-ID')}</td>
                  <td className="border border-gray-400 px-4 py-2 text-center">Rp. {item?.tteralokasi?.toLocaleString('id-ID')}</td>
                  <td className="border border-gray-400 px-4 py-2 text-center">{item?.tteralokasi !== null && item?.transfer !== null && item?.transfer !== 0 ? ((item?.tteralokasi / item?.transfer) * 100).toFixed(0) + "%" : "0%"}</td>
                </tr>
              ))}
              <tr>
                <td className="border border-gray-400 px-4 py-2 text-center font-medium">Jumlah Belanja Operasi</td>
                <td className="border border-gray-400 px-4 py-2 text-center font-medium">Rp. {anggarann?.OperasiJumlahAlokasi}</td>
                <td className="border border-gray-400 px-4 py-2 text-center font-medium">Rp. {anggarann?.OperasiTeralokasi}</td>
                <td className="border border-gray-400 px-4 py-2 text-center font-medium">{anggarann?.Operasipersen ? anggarann?.Operasipersen : 0}%</td>
                <td className="border border-gray-400 px-4 py-2" colSpan={12}></td>
              </tr>
              <tr>
                <td className="border border-gray-400 px-4 py-2 text-center font-medium">Jumlah Belanja Modal</td>
                <td className="border border-gray-400 px-4 py-2 text-center font-medium">Rp. {anggarann?.ModalAlokasi.toLocaleString('id-ID')}</td>
                <td className="border border-gray-400 px-4 py-2 text-center font-medium">Rp. {anggarann?.ModalTeralokasi.toLocaleString('id-ID')}</td>
                <td className="border border-gray-400 px-4 py-2 text-center font-medium">{anggarann?.Modalpersen ? anggarann?.Modalpersen : 0}%</td>
                <td className="border border-gray-400 px-4 py-2" colSpan={12}></td>
              </tr>
              <tr>
                <td className="border border-gray-400 px-4 py-2 text-center font-medium">Jumlah Belanja Tidak Terduga</td>
                <td className="border border-gray-400 px-4 py-2 text-center font-medium">Rp. {anggarann?.ttAlokasi.toLocaleString('id-ID')}</td>
                <td className="border border-gray-400 px-4 py-2 text-center font-medium">Rp. {anggarann?.ttTeralokasi.toLocaleString('id-ID')}</td>
                <td className="border border-gray-400 px-4 py-2 text-center font-medium">{anggarann?.ttpersen ? anggarann?.ttpersen : 0}%</td>
                <td className="border border-gray-400 px-4 py-2" colSpan={12}></td>
              </tr>
              <tr>
                <td className="border border-gray-400 px-4 py-2 text-center font-medium">Jumlah Belanja Transfer</td>
                <td className="border border-gray-400 px-4 py-2 text-center font-medium">Rp. {anggarann?.transferAlokasi.toLocaleString('id-ID')}</td>
                <td className="border border-gray-400 px-4 py-2 text-center font-medium">Rp. {anggarann?.transferTeralokasi.toLocaleString('id-ID')}</td>
                <td className="border border-gray-400 px-4 py-2 text-center font-medium">{anggarann?.transferpersen ? anggarann?.transferpersen : 0}%</td>
                <td className="border border-gray-400 px-4 py-2" colSpan={12}></td>
              </tr>
              <tr>
                <td className="border border-gray-400 px-4 py-2 text-center font-medium">Total</td>
                <td className="border border-gray-400 px-4 py-2 text-center font-medium">Rp. {anggarann?.totalJumlahAlokasi.toLocaleString('id-ID')}</td>
                <td className="border border-gray-400 px-4 py-2 text-center font-medium">Rp. {anggarann?.totalTeralokasi.toLocaleString('id-ID')}</td>
                <td className="border border-gray-400 px-4 py-2 text-center font-medium">{anggarann?.totalpersen ? anggarann?.totalpersen : 0}%</td>
                <td className="border border-gray-400 px-4 py-2" colSpan={12}></td>
              </tr>
            </tbody>

          </table>

        </div>
      </div>
    </Layout>
  )
}

export default Page