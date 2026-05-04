'use server';

import { supabase } from '@/lib/supabase';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';

export async function loginUser(formData: FormData) {
  const username = formData.get('username') as string;
  const password = formData.get('password') as string;

  try {
    // 1. Cari user di database Supabase
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('username', username)
      .single();

    if (error || !user) {
      return { success: false, message: 'Username tidak ditemukan' };
    }

    // 2. Cek Password 
    // Catatan: Karena lu masukin 'admin123' secara plain text di SQL untuk testing,
    // kita buat logic yang bisa ngebaca plain text ATAU hash bcrypt.
    let isMatch = false;
    
    // Cek apakah password di DB masih plain text (sementara)
    if (user.password_hash === password) {
      isMatch = true;
    } else {
      // Kalau udah di-hash pakai bcrypt
      isMatch = await bcrypt.compare(password, user.password_hash);
    }

    if (!isMatch) {
      return { success: false, message: 'Password salah' };
    }

    // 3. Set Session di Cookies
    // Kita simpan data penting aja di cookie (jangan simpan password!)
    const sessionData = {
      id: user.id,
      username: user.username,
      role: user.role,
      name: user.name
    };

    // Tambahin 'await' dan panggil cookies()
    const cookieStore = await cookies();
    cookieStore.set('session_kas', JSON.stringify(sessionData), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24, 
      path: '/',
    });

    return { success: true };

  } catch (err) {
    console.error("Login error:", err);
    return { success: false, message: 'Terjadi kesalahan pada server' };
  }
}

export async function logoutUser() {
  const cookieStore = await cookies();
  cookieStore.delete('session_kas');
}