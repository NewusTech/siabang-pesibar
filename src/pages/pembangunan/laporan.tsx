import { useState } from "react";
import Breadcrumbs from "~/components/BreadCrumbs"
import { Layout } from "~/components/layout"
import { api } from "~/utils/api";

const Page = () => {

  const [namaDinas, setnamaDinas] = useState<string>('');
  const [selectedDinas, setSelectedDinas] = useState<string>('');
  const [selectedMonth, setSelectedMonth] = useState<string>('');
  const [selectedYear, setSelectedYear] = useState<string>('');

  const { data: anggarann } = api.pembangunan.getanggaran.useQuery({ selectedDinas, selectedMonth, selectedYear });

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
          <div className="pr-2">
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
        </div>
        <div>
          <p className="font-bold text-md text-black text-center">
            REKAPITULASI LAPORAN MONITORING DAN EVALUASI PEMBANGUNAN
          </p>
          <p className="font-bold text-md text-black text-center">
            KABUPATEN PESISIR BARAT TAHUN {selectedYear ? 'Tahun' : ''} {selectedYear ? years.find(year => year.value === selectedYear)?.label : 'Semua Tahun'}
          </p>
          <p className="font-bold text-md text-black text-center">
            {selectedMonth ? 'Bulan' : ''} {selectedMonth ? months.find(month => month.value === selectedMonth)?.label : 'Semua Bulan'}
          </p>
        </div>
        <div className="overflow-x-auto">
          <p className="font-normal">Perangkat Daerah:{namaDinas ? ' ' + namaDinas : ' Semua Perangkat Daerah'}</p>
          <table style={{ width: "100%" }} className="table-auto rounded-lg border border-collapse border-gray-400">
            <thead className="bg-blue-600 text-white">
              <tr>
                <th className="border border-gray-400 px-4 py-2 font-normal" rowSpan={3}>Program/Kegiatan/Sub Kegiatan</th>
              </tr>
              <tr>
                <th className="border border-gray-400 px-4 py-2 font-normal" colSpan={3}>Total Anggaran</th>
              </tr>
              <tr>
                <th className="border border-gray-400 px-4 py-2 font-normal">Nilai Kontrak</th>
                <th className="border border-gray-400 px-4 py-2 font-normal">Keuangan</th>
                <th className="border border-gray-400 px-4 py-2 font-normal">Fisik</th>
              </tr>
            </thead>
            <tbody>
              {/* {} */}
              {anggarann?.anggaran && anggarann?.anggaran.map(item => (
                <tr key={item.id}>
                  <td className="border border-gray-400 px-4 py-2">{item?.Kegiatan?.program?.name} / {item?.Kegiatan?.name}</td>
                  <td className="border border-gray-400 px-4 py-2 text-center">Rp. {item?.jumlahAlokasi?.toLocaleString('id-ID')}</td>
                  <td className="border border-gray-400 px-4 py-2 text-center">Rp. {item?.teralokasi?.toLocaleString('id-ID')}</td>
                  <td className="border border-gray-400 px-4 py-2 text-center">{item?.teralokasi !== null && item?.jumlahAlokasi !== null ? ((item?.teralokasi / item?.jumlahAlokasi) * 100).toFixed(0) + "%" : "0%"}</td>
                </tr>
              ))}
              <tr>
                <td className="border border-gray-400 px-4 py-2 text-center font-medium">Total Anggaran</td>
                <td className="border border-gray-400 px-4 py-2 text-center font-medium">Rp. {anggarann?.totalJumlahAlokasi.toLocaleString('id-ID')}</td>
                <td className="border border-gray-400 px-4 py-2 text-center font-medium">Rp. {anggarann?.totalTeralokasi.toLocaleString('id-ID')}</td>
                <td className="border border-gray-400 px-4 py-2 text-center font-medium">{anggarann?.totalpersen ? anggarann?.totalpersen : 0}%</td>
              </tr>
            </tbody>

          </table>

        </div>
      </div>
    </Layout>
  )
}

export default Page