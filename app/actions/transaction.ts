'use server';

import { supabase } from '@/lib/supabase';
import { revalidatePath } from 'next/cache';

// Fungsi untuk Approve
export async function approveTransaction(transactionId: string) {
  try {
    const { error } = await supabase
      .from('transactions')
      .update({ status: 'completed' })
      .eq('id', transactionId);

    if (error) throw new Error('Gagal menyetujui transaksi');
    
    // Me-refresh halaman utama supaya data & saldo langsung update
    revalidatePath('/');
    return { success: true };
  } catch (error: any) {
    console.error(error);
    return { success: false, message: error.message };
  }
}

// Fungsi untuk Reject (Menghapus Transaksi)
export async function rejectTransaction(transactionId: string) {
  try {
    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', transactionId);

    if (error) throw new Error('Gagal menolak (menghapus) transaksi');
    
    revalidatePath('/');
    return { success: true };
  } catch (error: any) {
    console.error(error);
    return { success: false, message: error.message };
  }
}