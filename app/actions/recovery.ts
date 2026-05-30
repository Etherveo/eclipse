'use server';

import { supabase } from '@/lib/supabase';
import bcrypt from 'bcryptjs';
import nodemailer from 'nodemailer';

// Konfigurasi Transporter Nodemailer (Senada dengan OTP Registrasi lu)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.SMTP_EMAIL,
    pass: process.env.SMTP_PASSWORD,
  },
});

// Langkah Awal: Cek Pengguna & Kirim OTP jika memilih metode Email
export async function initiateRecovery(identifier: string, method: 'pin' | 'otp') {
  try {
    // 1. Tambahkan group_id ke dalam select
    const { data: user, error } = await supabase
      .from('users')
      .select('id, email, username, group_id, role') 
      .or(`username.eq.${identifier},email.eq.${identifier}`)
      .single();

    if (error || !user) {
      return { success: false, message: 'Username atau Email tidak terdaftar!' };
    }

    if (method === 'pin') {
      return { success: true, userId: user.id, method: 'pin' };
    }

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

    // 2. Masukkan group_id ke dalam log insert system_requests
    const { error: otpErr } = await supabase.from('system_requests').insert([{
      group_id: user.group_id || null, // Tambahkan ini agar tidak melanggar aturan SaaS V2
      requester_id: user.id,
      request_type: 'reset_otp',
      target_role: user.role || 'user',
      status: 'pending',
      payload: { otp: otpCode }
    }]);

    if (otpErr) throw new Error('Gagal membuat token keamanan.' + otpErr.message);

    // Kirim Kode keamanan ke email terdaftar
    await transporter.sendMail({
      from: `"Kas Eclipse Security" <${process.env.SMTP_EMAIL}>`,
      to: user.email,
      subject: '🔑 Kode Keamanan Reset Sandi Kas Eclipse',
      html: `
        <div style="font-family: sans-serif; padding: 24px; max-width: 450px; border: 1px solid #e4e4e7; border-radius: 16px;">
          <h2 style="color: #0f172a; margin-bottom: 4px;">Permintaan Reset Kata Sandi</h2>
          <p style="color: #71717a; font-size: 14px;">Kami menerima permintaan pengaturan ulang kata sandi untuk akun <strong>@${user.username}</strong>.</p>
          <div style="background: #f4f4f5; padding: 16px; text-align: center; font-size: 26px; font-weight: 900; letter-spacing: 6px; color: #18181b; border-radius: 12px; margin: 24px 0;">
            ${otpCode}
          </div>
          <p style="font-size: 11px; color: #a1a1aa; line-height: 1.4;">Jika Anda tidak merasa melakukan permintaan ini, abaikan email ini. Kode ini rahasia, jangan berikan kepada siapa pun termasuk pengurus kelas.</p>
        </div>
      `
    });

    return { success: true, userId: user.id, method: 'otp' };
  } catch (err: any) {
    return { success: false, message: err.message };
  }
}

// Langkah Akhir: Validasi Token (PIN/OTP) & Update Password Baru
export async function verifyAndResetPassword(payload: any) {
  const { userId, method, token, newPassword } = payload;

  try {
    // 1. Tarik kolom pin_hash, bukan pin
    const { data: user, error: userErr } = await supabase
      .from('users')
      .select('pin_hash') 
      .eq('id', userId)
      .single();

    if (userErr || !user) throw new Error('Sesi pemulihan tidak valid.');

    // 2. VALIDASI METODE PIN (Gunakan Bcrypt Compare)
    if (method === 'pin') {
      if (!user.pin_hash) {
        return { success: false, message: 'Akun Anda belum memiliki PIN Koperasi!' };
      }
      
      const isPinMatch = await bcrypt.compare(token, user.pin_hash);
      if (!isPinMatch) {
        return { success: false, message: 'Kode PIN Koperasi Anda salah!' };
      }
    } 
    // 3. VALIDASI METODE OTP EMAIL
    else if (method === 'otp') {
      const { data: reqData, error: reqErr } = await supabase
        .from('system_requests')
        .select('id, payload')
        .eq('requester_id', userId)
        .eq('request_type', 'reset_otp')
        .eq('status', 'pending')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (reqErr || !reqData || reqData.payload?.otp !== token) {
        return { success: false, message: 'Kode OTP salah atau sudah kedaluwarsa!' };
      }

      await supabase.from('system_requests').update({ status: 'completed' }).eq('id', reqData.id);
    }

    // 4. PROSES UPDATE PASSWORD BARU
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    const { error: updateErr } = await supabase
      .from('users')
      .update({ password_hash: hashedPassword })
      .eq('id', userId);

    if (updateErr) throw new Error('Gagal memperbarui database kata sandi.');

    return { success: true };
  } catch (err: any) {
    return { success: false, message: err.message };
  }
}