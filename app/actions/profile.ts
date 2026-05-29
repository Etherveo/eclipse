'use server';

import { supabase } from '@/lib/supabase';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

export async function updateProfile(formData: FormData) {
  const id = formData.get('id') as string;
  const fullName = formData.get('full_name') as string;
  const title = formData.get('title') as string;
  const phoneNumber = formData.get('phone_number') as string;
  
  // Tangkap data sosmed
  const ig = formData.get('ig') as string;
  const fb = formData.get('fb') as string;
  const tiktok = formData.get('tiktok') as string;
  const x = formData.get('x') as string;

  const socialLinks = { ig, fb, tiktok, x };

  try {
    // 1. Update ke Database (Menyesuaikan kolom full_name dan social_links JSONB)
    const { error } = await supabase
      .from('users')
      .update({ 
        full_name: fullName, 
        title: title || null,
        phone_number: phoneNumber || null,
        social_links: socialLinks
      })
      .eq('id', id);

    if (error) throw new Error('Gagal menyimpan perubahan profil: ' + error.message);

    // 2. Update Cookie Session supaya nama di header dashboard ikut berubah
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('session_kas');
    
    if (sessionCookie) {
      const sessionData = JSON.parse(sessionCookie.value);
      sessionData.name = fullName; // Update nama aktif di session
      
      cookieStore.set('session_kas', JSON.stringify(sessionData), {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 24,
        path: '/',
      });
    }

    // Refresh halaman agar data terbaru langsung dimuat ulang
    revalidatePath('/');
    revalidatePath('/dev');
    revalidatePath('/admin');
    revalidatePath('/user');
    revalidatePath('/profil');
    
    return { success: true };
  } catch (error: any) {
    console.error(error);
    return { success: false, message: error.message };
  }
}