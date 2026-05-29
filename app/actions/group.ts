'use server';

import { supabase } from '@/lib/supabase';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

// Fungsi Khusus Admin untuk Bikin Kelas Baru
export async function createGroup(groupName: string, userId: string) {
  try {
    // 1. Insert ke tabel groups
    const { data: newGroup, error: groupError } = await supabase
      .from('groups')
      .insert([{ name: groupName, owner_id: userId }])
      .select('id')
      .single();

    if (groupError || !newGroup) throw new Error('Gagal membuat kelompok baru.');

    // 2. Update group_id user tersebut
    const { error: userError } = await supabase
      .from('users')
      .update({ group_id: newGroup.id })
      .eq('id', userId);

    if (userError) throw new Error('Gagal menyambungkan akun ke kelompok.');

    // 3. Update Session Cookie
    await refreshGroupCookie(newGroup.id);
    
    return { success: true };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

// Fungsi Khusus Anggota untuk Join Kelas
export async function joinGroup(groupId: string, userId: string) {
  try {
    // 1. Validasi apakah Grup-nya eksis
    const { data: group, error: groupError } = await supabase
      .from('groups')
      .select('id')
      .eq('id', groupId)
      .single();

    if (groupError || !group) throw new Error('ID Kelompok tidak ditemukan atau tidak valid.');

    // 2. Update group_id user
    const { error: userError } = await supabase
      .from('users')
      .update({ group_id: groupId })
      .eq('id', userId);

    if (userError) throw new Error('Gagal bergabung ke kelompok.');

    // 3. Update Session Cookie
    await refreshGroupCookie(groupId);

    return { success: true };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

// Fungsi Bantuan untuk refresh Cookie
async function refreshGroupCookie(groupId: string) {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('session_kas');
  if (sessionCookie) {
    const sessionData = JSON.parse(sessionCookie.value);
    sessionData.group_id = groupId; // Update ID Grup di Cookie!
    cookieStore.set('session_kas', JSON.stringify(sessionData), {
      httpOnly: true, secure: process.env.NODE_ENV === 'production', maxAge: 60 * 60 * 24, path: '/'
    });
  }
  revalidatePath('/');
}