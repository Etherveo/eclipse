'use server';

import { supabase } from '@/lib/supabase';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

export async function approveLoan(requestId: string) {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('session_kas');
  if (!sessionCookie) return { success: false, message: 'Sesi tidak valid.' };
  
  const session = JSON.parse(sessionCookie.value);

  try {
    // 1. Ambil detail request pinjaman
    const { data: request, error: reqErr } = await supabase
      .from('system_requests')
      .select('*')
      .eq('id', requestId)
      .single();

    if (reqErr || !request) throw new Error('Request tidak ditemukan.');

    // 2. Insert ke transaksi sebagai Uang Keluar (Pencairan)
    const { error: trxErr } = await supabase.from('transactions').insert([{
      group_id: request.group_id,
      user_id: request.user_id,
      user_snapshot: { username: request.payload.user_name, full_name: request.payload.user_name },
      type: 'outcome', // Uang keluar dari kas
      amount: request.payload.amount,
      payment_method: 'transfer',
      status: 'completed',
      proof_image_url: request.payload.ktm_url, // KTM sebagai bukti transaksi
      notes: 'Pencairan Dana Pinjaman Koperasi'
    }]);

    if (trxErr) throw new Error('Gagal mencatat pencairan dana.');

    // 3. Tambahkan saldo angsuran (hutang) ke User
    // Karena kita tidak bisa baca saldo lama via RPC langsung tanpa buat fungsi baru,
    // kita tarik dulu data user-nya.
    const { data: userData } = await supabase
      .from('users')
      .select('debt_balance')
      .eq('id', request.user_id)
      .single();

    const currentDebt = userData?.debt_balance || 0;
    const newDebt = currentDebt + request.payload.amount;

    await supabase
      .from('users')
      .update({ debt_balance: newDebt })
      .eq('id', request.user_id);

    // 4. Update status request
    await supabase
      .from('system_requests')
      .update({ status: 'approved' })
      .eq('id', requestId);

    revalidatePath('/admin');
    revalidatePath('/user');
    return { success: true };
  } catch (err: any) {
    return { success: false, message: err.message };
  }
}

export async function rejectLoan(requestId: string) {
  try {
    const { error } = await supabase
      .from('system_requests')
      .update({ status: 'rejected' })
      .eq('id', requestId);

    if (error) throw new Error('Gagal menolak pinjaman.');

    revalidatePath('/admin');
    revalidatePath('/user');
    return { success: true };
  } catch (err: any) {
    return { success: false, message: err.message };
  }
}