'use server';

import { supabase } from '@/lib/supabase';
import bcrypt from 'bcryptjs';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';

export async function addUser(formData: FormData) {
  // 1. Ambil sesi Admin untuk mengetahui group_id-nya
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('session_kas');
  if (!sessionCookie) return { success: false, message: 'Sesi tidak valid. Silakan login ulang.' };
  
  const session = JSON.parse(sessionCookie.value);

  const fullName = formData.get('full_name') as string;
  const username = formData.get('username') as string;
  const password = formData.get('password') as string;
  const role = formData.get('role') as string;
  const title = formData.get('title') as string;

  try {
    // 2. Cek apakah username sudah dipakai
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('username', username)
      .single();

    if (existingUser) {
      return { success: false, message: 'Username sudah terpakai, pilih yang lain.' };
    }

    // 3. Hash password menggunakan bcrypt
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 4. Insert ke tabel users
    const { error } = await supabase
      .from('users')
      .insert([
        {
          group_id: session.group_id, // Ikat user baru ke kelompok Admin ini
          full_name: fullName,        // Menggunakan kolom DB V2
          username,
          password_hash: hashedPassword,
          role,
          title,
          approval_status: 'approved' // Otomatis disetujui karena Admin yang buat
        }
      ]);

    if (error) throw new Error(error.message);

    revalidatePath('/admin/student');
    return { success: true };
  } catch (error: any) {
    console.error("Add user error:", error);
    return { success: false, message: 'Gagal menambahkan user baru.' };
  }
}

// Fungsi Edit User
export async function updateUser(userId: string, formData: FormData) {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('session_kas');
  if (!sessionCookie) return { success: false, message: 'Sesi tidak valid.' };
  const session = JSON.parse(sessionCookie.value);

  const full_name = formData.get('full_name') as string;
  const username = formData.get('username') as string;
  const email = formData.get('email') as string;
  const phone_number = formData.get('phone_number') as string;
  const title = formData.get('title') as string;
  const role = formData.get('role') as string;
  const approval_status = formData.get('approval_status') as string;

  // Tangkap data sosmed
  const ig = formData.get('ig') as string;
  const fb = formData.get('fb') as string;
  const tiktok = formData.get('tiktok') as string;
  const x = formData.get('x') as string;
  const social_links = { ig, fb, tiktok, x };

  try {
    const { error } = await supabase.from('users')
      .update({ 
        full_name, 
        username, 
        email, 
        phone_number: phone_number || null, 
        title, 
        role, 
        approval_status, 
        social_links 
      })
      .eq('id', userId)
      .eq('group_id', session.group_id);

    if (error) throw new Error(error.message);

    revalidatePath('/admin/student');
    return { success: true };
  } catch (err: any) {
    return { success: false, message: 'Gagal mengedit user: ' + err.message };
  }
}

// Fungsi Hapus User
export async function deleteUser(userId: string) {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('session_kas');
  if (!sessionCookie) return { success: false, message: 'Sesi tidak valid.' };
  const session = JSON.parse(sessionCookie.value);

  try {
    const { error } = await supabase.from('users')
      .delete()
      .eq('id', userId)
      .eq('group_id', session.group_id);

    if (error) throw new Error(error.message);

    revalidatePath('/admin/student');
    return { success: true };
  } catch (err: any) {
    return { success: false, message: 'Gagal menghapus user: ' + err.message };
  }
}