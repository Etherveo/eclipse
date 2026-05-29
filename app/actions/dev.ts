'use server';

import { supabase } from '@/lib/supabase';
import { revalidatePath } from 'next/cache';

export async function approveAdminRequest(userId: string) {
  try {
    const { error } = await supabase
      .from('users')
      .update({ approval_status: 'approved' })
      .eq('id', userId);

    if (error) throw new Error('Gagal menyetujui admin.');

    revalidatePath('/dev');
    return { success: true };
  } catch (error: any) {
    console.error(error);
    return { success: false, message: error.message };
  }
}

export async function rejectAdminRequest(userId: string) {
  try {
    // Kalo di-reject, kita set statusnya 'rejected'.
    // Atau lu bisa pakai fungsi .delete() kalau pengajuan gagal mau langsung dihapus datanya.
    const { error } = await supabase
      .from('users')
      .update({ approval_status: 'rejected' })
      .eq('id', userId);

    if (error) throw new Error('Gagal menolak admin.');

    revalidatePath('/dev');
    return { success: true };
  } catch (error: any) {
    console.error(error);
    return { success: false, message: error.message };
  }
}