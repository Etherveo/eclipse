'use server';

import { supabase } from '@/lib/supabase';
import { revalidatePath } from 'next/cache';

export async function uploadQris(formData: FormData) {
  const file = formData.get('file') as File;
  if (!file) return { success: false, message: 'File tidak ditemukan' };

  try {
    const fileExt = file.name.split('.').pop();
    // Bikin nama file unik pakai timestamp biar nggak ke-cache saat di-replace
    const fileName = `qris_${Date.now()}.${fileExt}`;

    // Upload ke bucket transaction_proofs (di dalam folder qris/)
    const { error: uploadError } = await supabase.storage
      .from('transaction_proofs')
      .upload(`qris/${fileName}`, file);

    if (uploadError) throw new Error('Gagal upload gambar QRIS');

    // Ambil URL public
    const { data: publicUrlData } = supabase.storage
      .from('transaction_proofs')
      .getPublicUrl(`qris/${fileName}`);

    const qrisUrl = publicUrlData.publicUrl;

    // Update ke tabel class_settings (id = 1)
    const { error: dbError } = await supabase
      .from('class_settings')
      .update({ qris_url: qrisUrl })
      .eq('id', 1);

    if (dbError) throw new Error('Gagal menyimpan URL ke database');

    revalidatePath('/'); // Refresh halaman
    return { success: true, url: qrisUrl };

  } catch (error: any) {
    console.error(error);
    return { success: false, message: error.message };
  }
}