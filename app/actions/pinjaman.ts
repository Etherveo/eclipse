'use server';

import { supabase } from '@/lib/supabase';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

export async function requestPinjaman(formData: FormData) {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('session_kas');
  if (!sessionCookie) return { success: false, message: 'Sesi tidak valid.' };
  
  const session = JSON.parse(sessionCookie.value);
  const amount = parseInt(formData.get('amount') as string);
  const ktmFile = formData.get('ktm_file') as File;

  // 1. Validasi Aturan Koperasi
  if (!amount || amount > 20000) {
    return { success: false, message: 'Nominal pinjaman maksimal Rp 20.000 per request.' };
  }
  if (!ktmFile || ktmFile.size === 0) {
    return { success: false, message: 'File KTM wajib diunggah sebagai jaminan.' };
  }

  try {
    // 2. Cek apakah bulan ini sudah pernah pinjam
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const { data: existingLoan, error: checkErr } = await supabase
      .from('system_requests')
      .select('id')
      .eq('user_id', session.id)
      .eq('type', 'loan')
      .gte('created_at', startOfMonth.toISOString())
      .limit(1);

    if (existingLoan && existingLoan.length > 0) {
      throw new Error('Limit tercapai: Kamu sudah mengajukan pinjaman bulan ini.');
    }

    // 3. Upload File KTM ke Bucket
    const fileExt = ktmFile.name.split('.').pop();
    const fileName = `ktm_${session.id}_${Date.now()}.${fileExt}`;
    
    const { error: uploadError } = await supabase.storage
      .from('ktm_proofs')
      .upload(fileName, ktmFile);
      
    if (uploadError) throw new Error('Gagal mengunggah file KTM: ' + uploadError.message);
    
    const { data: urlData } = supabase.storage.from('ktm_proofs').getPublicUrl(fileName);
    const ktmUrl = urlData.publicUrl;

    // 4. Tentukan target Approval (Jika Admin -> Ketua, Jika Anggota -> Admin)
    const targetRole = session.role === 'admin' ? 'ketua' : 'admin';

    // 5. Masukkan ke tabel system_requests
    const { error: insertError } = await supabase.from('system_requests').insert([{
      group_id: session.group_id,
      user_id: session.id,
      type: 'loan',
      target_role: targetRole,
      payload: {
        amount: amount,
        ktm_url: ktmUrl,
        user_name: session.name
      },
      status: 'pending'
    }]);

    if (insertError) throw new Error('Gagal mencatat pengajuan pinjaman.');

    revalidatePath('/user');
    revalidatePath('/admin');
    
    return { success: true };
  } catch (err: any) {
    return { success: false, message: err.message };
  }
}