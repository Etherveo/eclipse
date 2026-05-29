"use client";

import { useState } from 'react';
import { approveMemberRequest, rejectMemberRequest } from '@/app/actions/admin';

export default function MemberRequestActions({ userId }: { userId: string }) {
  const [isLoading, setIsLoading] = useState(false);

  const handleApprove = async () => {
    setIsLoading(true);
    await approveMemberRequest(userId);
    setIsLoading(false);
  };

  const handleReject = async () => {
    if (confirm("Tolak pengguna ini dari kelompok?")) {
      setIsLoading(true);
      await rejectMemberRequest(userId);
      setIsLoading(false);
    }
  };

  return (
    <div className="flex gap-2 justify-end">
      <button 
        onClick={handleApprove} disabled={isLoading}
        className="px-3 py-1.5 bg-blue-100 text-blue-700 hover:bg-blue-200 rounded-lg text-xs font-bold transition disabled:opacity-50"
      >
        {isLoading ? '...' : 'Terima'}
      </button>
      <button 
        onClick={handleReject} disabled={isLoading}
        className="px-3 py-1.5 bg-red-100 text-red-700 hover:bg-red-200 rounded-lg text-xs font-bold transition disabled:opacity-50"
      >
        {isLoading ? '...' : 'Tolak'}
      </button>
    </div>
  );
}