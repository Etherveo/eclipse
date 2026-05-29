'use server';

import { supabase } from '@/lib/supabase';
import bcrypt from 'bcryptjs';

export async function registerUser(formData: FormData) {
  const role = formData.get('role') as string;
  const username = formData.get('username') as string;
  const fullName = formData.get('full_name') as string;
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  
  // Khusus Admin
  const pin = formData.get('pin') as string | null;
  const ktmFile = formData.get('ktm_file') as File | null;

  try {
    // 1. Validasi Username & Email unik
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .or(`username.eq.${username},email.eq.${email}`)
      .single();

    if (existingUser) return { success: false, message: 'Username atau Email sudah terdaftar.' };

    // 2. Hash Password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 3. Setup variabel khusus Admin
    let hashedPin = null;
    let ktmUrl = null;

    if (role === 'admin') {
      if (!pin || pin.length !== 6) return { success: false, message: 'PIN wajib 6 digit.' };
      if (!ktmFile) return { success: false, message: 'File KTM wajib diunggah untuk Admin.' };

      hashedPin = await bcrypt.hash(pin, salt);

      // Upload KTM ke Bucket 'ktm_proofs'
      const fileExt = ktmFile.name.split('.').pop();
      const fileName = `ktm_${username}_${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('ktm_proofs')
        .upload(fileName, ktmFile);

      if (uploadError) throw new Error(`Gagal mengunggah foto KTM: ${uploadError.message}`);

      const { data } = supabase.storage.from('ktm_proofs').getPublicUrl(fileName);
      ktmUrl = data.publicUrl;
    }

    // 4. Insert User ke Database (group_id null dulu sampai nanti join/buat kelas)
    // status default adalah 'pending'
    const { error: insertError, data: newUser } = await supabase
      .from('users')
      .insert([{
        username,
        email,
        full_name: fullName,
        password_hash: hashedPassword,
        pin_hash: hashedPin,
        role,
        approval_status: 'pending' // Masuk antrean
      }])
      .select('id')
      .single();

    if (insertError) throw new Error(insertError.message);

    // 5. Jika Admin, lempar data KTM ke system_requests untuk direview Developer
    if (role === 'admin' && newUser) {
      await supabase.from('system_requests').insert([{
        requester_id: newUser.id,
        target_role: 'developer',
        request_type: 'register_admin',
        payload: { ktm_url: ktmUrl }
      }]);
    }

    return { success: true, message: 'Registrasi berhasil! Silakan login untuk melihat status persetujuan.' };

  } catch (error: any) {
    console.error('Register error:', error);
    return { success: false, message: error.message || 'Terjadi kesalahan sistem.' };
  }
}