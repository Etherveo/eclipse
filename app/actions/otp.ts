'use server';

import { supabase } from '@/lib/supabase';
import { sendEmailOTP } from '@/lib/mailer';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

export async function requestOTP(userId: string, email: string) {
  try {
    // Generate 6 digit angka random
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    // Kedaluwarsa dalam 10 menit
    const expiry = new Date(Date.now() + 10 * 60000).toISOString();

    const { error } = await supabase
      .from('users')
      .update({ otp_code: otp, otp_expiry: expiry })
      .eq('id', userId);

    if (error) throw new Error('Gagal menyimpan OTP ke database.');

    await sendEmailOTP(email, otp);
    return { success: true };
  } catch (error: any) {
    console.error(error);
    return { success: false, message: error.message || 'Gagal mengirim OTP.' };
  }
}

export async function verifyOTP(userId: string, inputOtp: string) {
  try {
    const { data: user, error } = await supabase
      .from('users')
      .select('otp_code, otp_expiry')
      .eq('id', userId)
      .single();

    if (error || !user) throw new Error('User tidak ditemukan.');
    
    // Validasi Cocok & Expired
    if (user.otp_code !== inputOtp) throw new Error('Kode OTP salah!');
    if (new Date() > new Date(user.otp_expiry)) throw new Error('Kode OTP sudah kedaluwarsa. Silakan minta ulang.');

    // Jika sukses, update email_verified_at dan bersihkan kolom OTP
    const { error: updateError } = await supabase
      .from('users')
      .update({ 
        email_verified_at: new Date().toISOString(),
        otp_code: null,
        otp_expiry: null
      })
      .eq('id', userId);

    if (updateError) throw new Error('Gagal memverifikasi akun.');

    // Update session cookie agar status verified terbaca
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('session_kas');
    if (sessionCookie) {
      const sessionData = JSON.parse(sessionCookie.value);
      sessionData.email_verified = true;
      cookieStore.set('session_kas', JSON.stringify(sessionData), {
        httpOnly: true, secure: process.env.NODE_ENV === 'production', maxAge: 60 * 60 * 24, path: '/'
      });
    }

    revalidatePath('/');
    return { success: true };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}