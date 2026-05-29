    "use client";

import { useState } from 'react';
import { approveLoan, rejectLoan } from '@/app/actions/koperasi';

export default function LoanBanner({ request }: { request: any }) {
  const [isLoading, setIsLoading] = useState(false);

  if (!request) return null;

  const handleApprove = async () => {
    setIsLoading(true);
    const res = await approveLoan(request.id);
    if (res.success) {
      alert('Pinjaman disetujui! Dana tercatat keluar dari kas.');
    } else {
      alert(res.message);
    }
    setIsLoading(false);
  };

  const handleReject = async () => {
    if (confirm('Yakin ingin menolak pengajuan ini?')) {
      setIsLoading(true);
      await rejectLoan(request.id);
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-rose-50 border border-rose-200 rounded-3xl overflow-hidden shadow-sm mb-6">
      <div className="p-4 border-b border-rose-200 flex justify-between items-center bg-rose-600">
        <h2 className="text-sm font-bold text-white flex items-center gap-2">
          <span>💳</span> Ada Pengajuan Pinjaman Baru!
        </h2>
      </div>
      <div className="p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <p className="font-bold text-gray-900">{request.payload.user_name} mengajukan pinjaman.</p>
          <p className="text-2xl font-black text-rose-600 my-1">Rp {request.payload.amount.toLocaleString('id-ID')}</p>
          <a href={request.payload.ktm_url} target="_blank" className="text-xs text-blue-600 hover:underline font-semibold">
            Lihat File Jaminan (KTM)
          </a>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <button 
            onClick={handleReject} disabled={isLoading}
            className="flex-1 md:flex-none px-4 py-2.5 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-xl text-sm font-bold transition disabled:opacity-50"
          >
            Tolak
          </button>
          <button 
            onClick={handleApprove} disabled={isLoading}
            className="flex-1 md:flex-none px-4 py-2.5 bg-rose-600 text-white hover:bg-rose-700 rounded-xl text-sm font-bold transition disabled:opacity-50"
          >
            {isLoading ? 'Memproses...' : 'Setujui & Cairkan'}
          </button>
        </div>
      </div>
    </div>
  );
}