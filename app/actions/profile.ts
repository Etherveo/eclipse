'use server';

import { supabase } from '@/lib/supabase';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

export async function updateProfile(formData: FormData) {
  const id = formData.get('id') as string;
  const name = formData.get('name') as string;
  const title = formData.get('title') as string;

  try {
    // 1. Update ke Database
    const { error } = await supabase
      .from('users')
      .update({ name, title })
      .eq('id', id);

    if (error) throw new Error('Gagal menyimpan perubahan profil');

    // 2. Update Cookie Session supaya nama di header ikut berubah
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('session_kas');
    
    if (sessionCookie) {
      const sessionData = JSON.parse(sessionCookie.value);
      sessionData.name = name; // Update nama di session
      
      cookieStore.set('session_kas', JSON.stringify(sessionData), {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 24,
        path: '/',
      });
    }

    // Refresh halaman agar data terbaru ter-load
    revalidatePath('/');
    revalidatePath('/user');
    revalidatePath('/profil');
    
    return { success: true };
  } catch (error: any) {
    console.error(error);
    return { success: false, message: error.message };
  }
}