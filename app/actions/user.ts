'use server';

import { supabase } from '@/lib/supabase';
import bcrypt from 'bcryptjs';
import { revalidatePath } from 'next/cache';

export async function addUser(formData: FormData) {
  const name = formData.get('name') as string;
  const username = formData.get('username') as string;
  const password = formData.get('password') as string;
  const role = formData.get('role') as string;
  const title = formData.get('title') as string;

  try {
    // 1. Cek apakah username sudah dipakai
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('username', username)
      .single();

    if (existingUser) {
      return { success: false, message: 'Username sudah terpakai, pilih yang lain.' };
    }

    // 2. Hash password menggunakan bcrypt
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 3. Insert ke tabel users
    const { error } = await supabase
      .from('users')
      .insert([
        {
          name,
          username,
          password_hash: hashedPassword,
          role,
          title
        }
      ]);

    if (error) throw new Error(error.message);

    revalidatePath('/student');
    return { success: true };
  } catch (error: any) {
    console.error("Add user error:", error);
    return { success: false, message: 'Gagal menambahkan user baru.' };
  }
}