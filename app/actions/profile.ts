'use server';

import { supabase } from '@/lib/supabase';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { uploadToMultiPlatform } from '@/lib/uploaders';
import bcrypt from 'bcryptjs'; // Pastikan diimpor di paling atas file jika belum ada

export async function updateProfile(formData: FormData) {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('session_kas');
  if (!sessionCookie) return { success: false, message: 'Sesi tidak valid.' };
  
  const session = JSON.parse(sessionCookie.value);

  const full_name = formData.get('full_name') as string;
  const title = formData.get('title') as string;
  const phone_number = formData.get('phone_number') as string;
  const ppFile = formData.get('profile_picture') as File | null;
  
  const ig = formData.get('ig') as string;
  const fb = formData.get('fb') as string;
  const tiktok = formData.get('tiktok') as string;
  const x = formData.get('x') as string;
  const social_links = { ig, fb, tiktok, x };

  try {
    let ppUrlsString = undefined;

    // Proses Upload Multi-Platform jika ada file
    if (ppFile && ppFile.size > 0) {
      if (ppFile.size > 500 * 1024) {
        throw new Error('Ukuran foto profil maksimal 500KB.');
      }

      const urls = await uploadToMultiPlatform(ppFile);
      if (urls.length === 0) {
        throw new Error('Semua platform upload gagal. Silakan coba lagi nanti.');
      }

      // Simpan array URL sebagai string JSON
      ppUrlsString = JSON.stringify(urls);
    }

    // Siapkan data update
    const updateData: any = { full_name, title, phone_number, social_links };
    if (ppUrlsString) updateData.profile_picture_url = ppUrlsString;

    const { error } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', session.id);

    if (error) throw new Error(error.message);

    // Update session cookie
    session.name = full_name;
    session.title = title;
    
    cookieStore.set('session_kas', JSON.stringify(session), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    });

    revalidatePath('/profil');
    return { success: true };
  } catch (err: any) {
    return { success: false, message: err.message };
  }
}

// Fungsi untuk Membuat atau Mengubah PIN Koperasi (Berlaku untuk semua Role)
export async function updatePin(formData: FormData) {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('session_kas');
  if (!sessionCookie) return { success: false, message: 'Sesi tidak valid.' };

  const session = JSON.parse(sessionCookie.value);
  const pin = formData.get('pin') as string;

  if (!pin || pin.length !== 6 || isNaN(Number(pin))) {
    return { success: false, message: 'PIN harus berupa 6 digit angka murni!' };
  }

  try {
    // Generasikan salt dan hash PIN murni menggunakan bcrypt sesuai isi DB lu
    const salt = await bcrypt.genSalt(10);
    const hashedPin = await bcrypt.hash(pin, salt);

    const { error } = await supabase
      .from('users')
      .update({ pin_hash: hashedPin }) // Mengubah 'pin' menjadi 'pin_hash'
      .eq('id', session.id);

    if (error) throw new Error(error.message);

    return { success: true };
  } catch (err: any) {
    return { success: false, message: 'Gagal memperbarui PIN: ' + err.message };
  }
}