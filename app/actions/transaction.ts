'use server';

import { supabase } from '@/lib/supabase';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

// 1. Fungsi Tambah Kas (Khusus Admin, Otomatis Completed)
export async function addTransactionAdmin(formData: FormData) {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('session_kas');
  if (!sessionCookie) return { success: false, message: 'Sesi tidak valid.' };
  
  const session = JSON.parse(sessionCookie.value);

  const type = formData.get('type') as string;
  const targetUserId = formData.get('user_id') as string;
  const amount = parseInt(formData.get('amount') as string);
  const paymentMethod = formData.get('payment_method') as string;
  const notes = formData.get('notes') as string;
  const proofFile = formData.get('proof_file') as File | null;

  if (!amount || amount <= 0) return { success: false, message: 'Nominal tidak valid.' };
  if (!targetUserId) return { success: false, message: 'Harap pilih anggota yang bersangkutan.' };

  try {
    const { data: targetUser, error: userErr } = await supabase
      .from('users')
      .select('username, full_name, debt_balance')
      .eq('id', targetUserId)
      .single();

    if (userErr || !targetUser) throw new Error('Data anggota tidak ditemukan.');

    let proofUrl = null;
    if (proofFile && proofFile.size > 0) {
      const fileExt = proofFile.name.split('.').pop();
      const fileName = `admin_proof_${session.group_id}_${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('transaction_proofs')
        .upload(fileName, proofFile);
        
      if (uploadError) throw new Error('Gagal mengunggah bukti: ' + uploadError.message);
      
      const { data } = supabase.storage.from('transaction_proofs').getPublicUrl(fileName);
      proofUrl = data.publicUrl;
    }

    const { error: insertError } = await supabase.from('transactions').insert([{
      group_id: session.group_id,
      user_id: targetUserId,
      user_snapshot: { username: targetUser.username, full_name: targetUser.full_name },
      type,
      amount,
      payment_method: paymentMethod,
      status: 'completed', 
      proof_image_url: proofUrl,
      notes
    }]);

    if (insertError) throw new Error('Gagal mencatat transaksi: ' + insertError.message);

    revalidatePath('/admin');
    revalidatePath('/admin/tambah');
    
    return { success: true };
  } catch (err: any) {
    console.error('Transaction Error:', err);
    return { success: false, message: err.message };
  }
}

// 2. Fungsi Approve Kas (Dari Anggota)
export async function approveTransaction(transactionId: string) {
  try {
    // 1. Ambil detail transaksi
    const { data: trx, error: trxErr } = await supabase
      .from('transactions')
      .select('*')
      .eq('id', transactionId)
      .single();

    if (trxErr || !trx) throw new Error('Transaksi tidak ditemukan.');

    // 2. Logika Pelunasan Koperasi: Jika pemasukan, cek apakah user punya angsuran/hutang
    if (trx.type === 'income' && trx.user_id) {
      const { data: userData } = await supabase
        .from('users')
        .select('debt_balance')
        .eq('id', trx.user_id)
        .single();

      const currentDebt = userData?.debt_balance || 0;
      if (currentDebt > 0) {
        // Kurangi hutang sesuai nominal setoran (tidak boleh kurang dari 0)
        const newDebt = Math.max(0, currentDebt - trx.amount);
        await supabase
          .from('users')
          .update({ debt_balance: newDebt })
          .eq('id', trx.user_id);
      }
    }

    // 3. Update status transaksi menjadi completed
    const { error } = await supabase
      .from('transactions')
      .update({ status: 'completed' })
      .eq('id', transactionId);

    if (error) throw new Error(error.message);

    revalidatePath('/admin');
    revalidatePath('/user');
    return { success: true };
  } catch (err: any) {
    console.error('Approve Error:', err);
    return { success: false, message: err.message };
  }
}

// 3. Fungsi Reject Kas (Dari Anggota)
export async function rejectTransaction(transactionId: string) {
  try {
    const { error } = await supabase
      .from('transactions')
      .update({ status: 'rejected' })
      .eq('id', transactionId);

    if (error) throw new Error(error.message);

    revalidatePath('/admin');
    revalidatePath('/user');
    return { success: true };
  } catch (err: any) {
    console.error('Reject Error:', err);
    return { success: false, message: err.message };
  }
}

// Fungsi Setor Kas (Khusus Anggota, Otomatis Pending)
export async function addTransactionUser(formData: FormData) {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('session_kas');
  if (!sessionCookie) return { success: false, message: 'Sesi tidak valid.' };
  
  const session = JSON.parse(sessionCookie.value);

  const amount = parseInt(formData.get('amount') as string);
  const paymentMethod = formData.get('payment_method') as string;
  const notes = formData.get('notes') as string;
  const proofFile = formData.get('proof_file') as File | null;

  if (!amount || amount <= 0) return { success: false, message: 'Nominal tidak valid.' };

  try {
    // Ambil snapshot user
    const { data: targetUser, error: userErr } = await supabase
      .from('users')
      .select('username, full_name')
      .eq('id', session.id)
      .single();

    if (userErr || !targetUser) throw new Error('Data pengguna tidak ditemukan.');

    let proofUrl = null;
    // Hanya proses upload jika metode transfer dan file ada
    if (paymentMethod === 'transfer' && proofFile && proofFile.size > 0) {
      const fileExt = proofFile.name.split('.').pop();
      const fileName = `user_proof_${session.group_id}_${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('transaction_proofs')
        .upload(fileName, proofFile);
        
      if (uploadError) throw new Error('Gagal mengunggah bukti transfer.');
      
      const { data } = supabase.storage.from('transaction_proofs').getPublicUrl(fileName);
      proofUrl = data.publicUrl;
    }

    const { error: insertError } = await supabase.from('transactions').insert([{
      group_id: session.group_id,
      user_id: session.id,
      user_snapshot: { username: targetUser.username, full_name: targetUser.full_name },
      type: 'income',
      amount,
      payment_method: paymentMethod,
      status: 'pending', // Wajib pending karena diinput oleh Anggota
      proof_image_url: proofUrl,
      notes
    }]);

    if (insertError) throw new Error('Gagal mengirim setoran: ' + insertError.message);

    revalidatePath('/user');
    revalidatePath('/admin');
    
    return { success: true };
  } catch (err: any) {
    console.error('Transaction Error:', err);
    return { success: false, message: err.message };
  }
}