"use client";

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import * as XLSX from 'xlsx';

export default function ReportFilter({ 
  transactions, 
  totalIncome, 
  totalOutcome 
}: { 
  transactions: any[], 
  totalIncome: number, 
  totalOutcome: number 
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Ambil state dari URL saat ini
  const [mode, setMode] = useState(searchParams.get('mode') || 'bulan_ini');
  const [specificDate, setSpecificDate] = useState(searchParams.get('date') || '');
  const [specificMonth, setSpecificMonth] = useState(searchParams.get('month') || '1');
  const [specificYear, setSpecificYear] = useState(searchParams.get('year') || new Date().getFullYear().toString());
  const [semester, setSemester] = useState(searchParams.get('semester') || '1');
  const [angkatan, setAngkatan] = useState(searchParams.get('angkatan') || new Date().getFullYear().toString());

  // Logika Cek Apakah Boleh Print/Excel (Hanya Bulanan, Semester, Tahunan)
  const isPrintable = ['bulan_ini', 'spesifik_bulan', 'semester_ini', 'spesifik_semester', 'tahun_ini', 'spesifik_tahun'].includes(mode);

  const applyFilter = () => {
    const params = new URLSearchParams();
    params.set('mode', mode);
    
    if (mode === 'spesifik_hari') params.set('date', specificDate);
    if (mode === 'spesifik_bulan') { params.set('month', specificMonth); params.set('year', specificYear); }
    if (mode === 'spesifik_semester') { params.set('semester', semester); params.set('angkatan', angkatan); }
    if (mode === 'spesifik_tahun') params.set('year', specificYear);

    router.push(`/report?${params.toString()}`);
  };

  const handleExportExcel = () => {
    if (!isPrintable) return alert('Ekspor Excel hanya tersedia untuk filter Bulanan, Semester, atau Tahunan.');

    const worksheetData = transactions.map((trx, index) => ({
      No: index + 1,
      Tanggal: new Date(trx.created_at).toLocaleDateString('id-ID'),
      Keterangan: trx.notes || '-',
      Pencatat: trx.users?.name || '-',
      Metode: trx.payment_method.toUpperCase(),
      Tipe: trx.type === 'income' ? 'Pemasukan' : 'Pengeluaran',
      Debit: trx.type === 'income' ? trx.amount : 0,
      Kredit: trx.type === 'outcome' ? trx.amount : 0,
    }));

    // Baris Total
    worksheetData.push({
      No: '' as any, Tanggal: '', Keterangan: 'TOTAL', Pencatat: '', Metode: '', Tipe: '',
      Debit: totalIncome,
      Kredit: totalOutcome
    });

    const worksheet = XLSX.utils.json_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Buku Kas");
    XLSX.writeFile(workbook, `Laporan_Kas_${mode}.xlsx`);
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-6 print:hidden">
      <h2 className="text-sm font-bold text-gray-700 mb-4">Filter Data Laporan</h2>
      
      <div className="flex flex-col md:flex-row gap-4 items-end">
        {/* Dropdown Mode Filter */}
        <div className="flex-1 w-full">
          <label className="block text-xs font-medium text-gray-500 mb-1">Periode Waktu</label>
          <select value={mode} onChange={(e) => setMode(e.target.value)} className="w-full border border-gray-300 rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 bg-white">
            <optgroup label="Harian & Mingguan">
              <option value="hari_ini">Hari Ini</option>
              <option value="kemarin">Kemarin</option>
              <option value="spesifik_hari">Pilih Tanggal Tertentu</option>
              <option value="mingguan">7 Hari Terakhir</option>
            </optgroup>
            <optgroup label="Bulanan">
              <option value="bulan_ini">Bulan Ini</option>
              <option value="spesifik_bulan">Pilih Bulan Tertentu</option>
            </optgroup>
            <optgroup label="Triwulan & Caturwulan">
              <option value="triwulan">Triwulan (3 Bulan Terakhir)</option>
              <option value="caturwulan">Caturwulan (4 Bulan Terakhir)</option>
            </optgroup>
            <optgroup label="Semester">
              <option value="semester_ini">Semester Ini (6 Bulan Terakhir)</option>
              <option value="spesifik_semester">Semester Spesifik (1-8)</option>
            </optgroup>
            <optgroup label="Tahunan">
              <option value="tahun_ini">Tahun Ini</option>
              <option value="spesifik_tahun">Pilih Tahun Tertentu</option>
            </optgroup>
          </select>
        </div>

        {/* Input Spesifik (Muncul sesuai mode yang dipilih) */}
        {mode === 'spesifik_hari' && (
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Tanggal</label>
            <input type="date" value={specificDate} onChange={(e) => setSpecificDate(e.target.value)} className="border border-gray-300 rounded-lg p-2 text-sm" />
          </div>
        )}

        {mode === 'spesifik_bulan' && (
          <>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Bulan</label>
              <select value={specificMonth} onChange={(e) => setSpecificMonth(e.target.value)} className="border border-gray-300 rounded-lg p-2.5 text-sm bg-white">
                {Array.from({length: 12}, (_, i) => <option key={i+1} value={i+1}>Bulan {i+1}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Tahun</label>
              <input type="number" value={specificYear} onChange={(e) => setSpecificYear(e.target.value)} className="border border-gray-300 rounded-lg p-2.5 text-sm w-24" />
            </div>
          </>
        )}

        {mode === 'spesifik_semester' && (
          <>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Semester</label>
              <select value={semester} onChange={(e) => setSemester(e.target.value)} className="border border-gray-300 rounded-lg p-2.5 text-sm bg-white">
                {Array.from({length: 8}, (_, i) => <option key={i+1} value={i+1}>Semester {i+1}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Tahun Angkatan</label>
              <input type="number" value={angkatan} onChange={(e) => setAngkatan(e.target.value)} className="border border-gray-300 rounded-lg p-2.5 text-sm w-24" />
            </div>
          </>
        )}

        {mode === 'spesifik_tahun' && (
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Tahun</label>
            <input type="number" value={specificYear} onChange={(e) => setSpecificYear(e.target.value)} className="border border-gray-300 rounded-lg p-2.5 text-sm w-24" />
          </div>
        )}

        {/* Tombol Terapkan Filter */}
        <button onClick={applyFilter} className="bg-gray-800 hover:bg-gray-900 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition whitespace-nowrap">
          Terapkan
        </button>
      </div>

      {/* Tombol Aksi Print & Excel (Hanya Aktif Sesuai Aturan) */}
      <div className="mt-6 pt-4 border-t border-gray-100 flex gap-3">
        <button 
          onClick={() => window.print()} 
          disabled={!isPrintable}
          className={`flex-1 md:flex-none px-5 py-2.5 rounded-lg text-sm font-medium transition flex items-center justify-center gap-2 ${isPrintable ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
        >
          🖨️ Cetak PDF
        </button>
        <button 
          onClick={handleExportExcel} 
          disabled={!isPrintable}
          className={`flex-1 md:flex-none px-5 py-2.5 rounded-lg text-sm font-medium transition flex items-center justify-center gap-2 ${isPrintable ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
        >
          📊 Ekspor Excel
        </button>
        
        {!isPrintable && (
          <p className="text-xs text-red-500 my-auto ml-2">*Cetak/Ekspor hanya untuk filter Bulanan, Semester, & Tahunan.</p>
        )}
      </div>
    </div>
  );
}