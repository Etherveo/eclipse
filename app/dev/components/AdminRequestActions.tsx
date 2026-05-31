"use client";

import { useState } from 'react';
import { approveAdminRequest, rejectAdminRequest } from '@/app/actions/dev';

export default function AdminRequestActions({ userId }: { userId: string }) {
  const [isLoading, setIsLoading] = useState(false);

  const handleApprove = async () => {
    setIsLoading(true);
    await approveAdminRequest(userId);
    setIsLoading(false);
  };

  const handleReject = async () => {
    if (confirm("Yakin ingin menolak pendaftaran admin ini?")) {
      setIsLoading(true);
      await rejectAdminRequest(userId);
      setIsLoading(false);
    }
  };

  return (
    <div className="flex gap-2 justify-end">
      <button 
        onClick={handleApprove} disabled={isLoading}
        className="px-4 py-1.5 bg-emerald-600 text-white border border-black hover:bg-gray-300 rounded-lg text-xs font-semibold transition disabled:opacity-50"
      >
        {isLoading ? '...' : 'Terima'}
      </button>
      <button 
        onClick={handleReject} disabled={isLoading}
        className="px-4 py-1.5 bg-red-500 text-white border border-black hover:bg-gray-300 hover:cursor-pointer rounded-lg text-xs font-semibold transition disabled:opacity-50"
      >
        {isLoading ? '...' : 'Tolak'}
      </button>
    </div>
  );
}