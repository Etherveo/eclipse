"use client";

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import * as XLSX from 'xlsx';

export default function FilterLaporan({ transactions }: { transactions: any[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const currentFilter = searchParams.get('filter') || 'bulan_ini';

  const [filterType, setFilterType] = useState(currentFilter);
  // State untuk input spesifik
  const [specificDate, setSpecificDate] = useState(searchParams.get('date') || '');
  const [specificMonth, setSpecificMonth] = useState(searchParams.get('month') || '');
  const [specificYear, setSpecificYear] = useState(searchParams.get('year') || new Date().getFullYear().toString());
  const [specificSemester, setSpecificSemester] = useState(searchParams.get('semester') || '');
  const [specificAngkatan, setSpecificAngkatan] = useState(searchParams.get('angkatan') || '');

  // Logika pembatasan cetak/ekspor 
  const isExportAllowed = ['bulan_ini', 'spesifik_bulan', 'semester_ini', 'spesifik_semester', 'tahun_ini', 'spesifik_tahunan', 'semua'].includes(filterType);

  const applyFilter = () => {
    const params = new URLSearchParams();
    params.set('filter', filterType);
    
    if (filterType === 'spesifik_hari' && specificDate) params.set('date', specificDate);
    if (filterType === 'spesifik_bulan' && specificMonth && specificYear) {
      params.set('month', specificMonth);
      params.set('year', specificYear);
    }
    if (filterType === 'spesifik_tahun' && specificYear) params.set('year', specificYear);
    if (filterType === 'spesifik_semester' && specificSemester && specificAngkatan) {
      params.set('semester', specificSemester);
      params.set('angkatan', specificAngkatan);
    }

    router.push(`/admin/report?${params.toString()}`);
  };

  const handleExportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(transactions.map(t => ({
      'Tanggal': new Date(t.created_at).toLocaleDateString('id-ID'),
      'Keterangan': t.notes,
      'Oleh': t.users?.full_name || t.user_snapshot?.full_name || '-',
      'Tipe': t.type === 'income' ? 'Pemasukan' : 'Pengeluaran',
      'Metode': t.payment_method,
      'Nominal': t.amount
    })));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Laporan Kas");
    XLSX.writeFile(wb, `Laporan_Kas_${filterType}_${new Date().getTime()}.xlsx`);
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4 justify-between items-end print:hidden mb-6">
      <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Periode Filter</label>
          <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="border border-gray-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-amber-500 text-sm w-full md:w-48 bg-white">
            <option value="semua">Semua Waktu</option>
            <option value="hari_ini">Hari Ini</option>
            <option value="kemarin">Kemarin</option>
            <option value="spesifik_hari">Tanggal Spesifik</option>
            <option value="mingguan">7 Hari Terakhir</option>
            <option value="bulan_ini">Bulan Ini</option>
            <option value="spesifik_bulan">Bulan Spesifik</option>
            <option value="triwulan">Triwulan (3 Bulan)</option>
            <option value="caturwulan">Caturwulan (4 Bulan)</option>
            <option value="semester_ini">Semester Ini (6 Bulan)</option>
            <option value="spesifik_semester">Semester Spesifik</option>
            <option value="tahun_ini">Tahun Ini</option>
            <option value="spesifik_tahun">Tahun Spesifik</option>
          </select>
        </div>

        {/* Dynamic Inputs based on Filter Type */}
        {filterType === 'spesifik_hari' && (
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Pilih Tanggal</label>
            <input type="date" value={specificDate} onChange={(e) => setSpecificDate(e.target.value)} className="border border-gray-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-amber-500 text-sm" />
          </div>
        )}

        {filterType === 'spesifik_bulan' && (
          <div className="flex gap-2">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Bulan</label>
              <input type="number" min="1" max="12" placeholder="1-12" value={specificMonth} onChange={(e) => setSpecificMonth(e.target.value)} className="border border-gray-300 rounded-lg p-2.5 outline-none text-sm w-20" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Tahun</label>
              <input type="number" placeholder="YYYY" value={specificYear} onChange={(e) => setSpecificYear(e.target.value)} className="border border-gray-300 rounded-lg p-2.5 outline-none text-sm w-24" />
            </div>
          </div>
        )}

        {filterType === 'spesifik_tahun' && (
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Tahun</label>
            <input type="number" placeholder="YYYY" value={specificYear} onChange={(e) => setSpecificYear(e.target.value)} className="border border-gray-300 rounded-lg p-2.5 outline-none text-sm w-24" />
          </div>
        )}

        {filterType === 'spesifik_semester' && (
          <div className="flex gap-2">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Angkatan</label>
              <input type="number" placeholder="YYYY" value={specificAngkatan} onChange={(e) => setSpecificAngkatan(e.target.value)} className="border border-gray-300 rounded-lg p-2.5 outline-none text-sm w-24" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Semester</label>
              <input type="number" min="1" max="8" placeholder="1-8" value={specificSemester} onChange={(e) => setSpecificSemester(e.target.value)} className="border border-gray-300 rounded-lg p-2.5 outline-none text-sm w-20" />
            </div>
          </div>
        )}

        <div className="flex items-end">
          <button onClick={applyFilter} className="bg-gray-900 text-white px-5 py-2.5 rounded-lg text-sm font-bold hover:bg-gray-800 transition w-full md:w-auto">Terapkan Filter</button>
        </div>
      </div>

      <div className="flex gap-2 w-full md:w-auto mt-4 md:mt-0">
        <button 
          onClick={() => window.print()} 
          disabled={!isExportAllowed}
          className="flex-1 md:flex-none border border-gray-300 text-gray-700 px-4 py-2.5 rounded-lg text-sm font-bold hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          🖨️ Cetak PDF
        </button>
        <button 
          onClick={handleExportExcel} 
          disabled={!isExportAllowed}
          className="flex-1 md:flex-none bg-green-600 text-white px-4 py-2.5 rounded-lg text-sm font-bold hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          📊 Ekspor Excel
        </button>
      </div>
    </div>
  );
}