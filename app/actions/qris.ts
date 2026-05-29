'use server';

import { supabase } from '@/lib/supabase';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';

export async function uploadQris(formData: FormData) {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('session_kas');
  if (!sessionCookie) return { success: false, message: 'Sesi tidak valid' };
  
  const session = JSON.parse(sessionCookie.value);
  const groupId = session.group_id;

  if (!groupId) return { success: false, message: 'Kelompok tidak ditemukan' };

  const file = formData.get('file') as File;
  if (!file) return { success: false, message: 'File tidak ditemukan' };

  try {
    const fileExt = file.name.split('.').pop();
    // Bikin nama file unik yang memuat ID Group agar tidak tertukar antar kelompok
    const fileName = `qris_${groupId}_${Date.now()}.${fileExt}`;

    // Upload ke bucket transaction_proofs (di dalam folder qris/)
    const { error: uploadError } = await supabase.storage
      .from('transaction_proofs')
      .upload(`qris/${fileName}`, file);

    if (uploadError) throw new Error('Gagal upload gambar QRIS: ' + uploadError.message);

    // Ambil URL public
    const { data: publicUrlData } = supabase.storage
      .from('transaction_proofs')
      .getPublicUrl(`qris/${fileName}`);

    const qrisUrl = publicUrlData.publicUrl;

    // Cek apakah class_settings untuk group_id ini sudah ada
    const { data: existingSetting } = await supabase
      .from('class_settings')
      .select('id')
      .eq('group_id', groupId)
      .single();

    if (existingSetting) {
      // Jika sudah ada, Update
      const { error: updateError } = await supabase
        .from('class_settings')
        .update({ qris_url: qrisUrl })
        .eq('group_id', groupId);
      if (updateError) throw new Error('Gagal update URL ke database');
    } else {
      // Jika belum ada, Insert baru
      const { error: insertError } = await supabase
        .from('class_settings')
        .insert([{ group_id: groupId, qris_url: qrisUrl }]);
      if (insertError) throw new Error('Gagal menyimpan URL ke database');
    }

    revalidatePath('/admin');
    revalidatePath('/user');

    return { success: true, qrisUrl };
  } catch (error: any) {
    console.error(error);
    return { success: false, message: error.message };
  }
}