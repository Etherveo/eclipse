'use server';

import { supabase } from '@/lib/supabase';
import { revalidatePath } from 'next/cache';

export async function approveMemberRequest(userId: string) {
  try {
    const { error } = await supabase
      .from('users')
      .update({ approval_status: 'approved' })
      .eq('id', userId);

    if (error) throw new Error('Gagal menyetujui anggota.');

    revalidatePath('/admin');
    return { success: true };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

export async function rejectMemberRequest(userId: string) {
  try {
    // Jika ditolak, kita set statusnya rejected dan hapus group_id-nya
    // supaya dia nggak nyangkut di kelas ini lagi kalau mau daftar ulang.
    const { error } = await supabase
      .from('users')
      .update({ approval_status: 'rejected', group_id: null })
      .eq('id', userId);

    if (error) throw new Error('Gagal menolak anggota.');

    revalidatePath('/admin');
    return { success: true };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}