'use server';

import { supabase } from '@/lib/supabase';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

export async function setTargetAdmin(formData: FormData) {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('session_kas');
  if (!sessionCookie) return { success: false, message: 'Sesi tidak valid.' };
  
  const session = JSON.parse(sessionCookie.value);

  const periodType = formData.get('period_type') as string;
  const targetAmount = parseInt(formData.get('target_amount') as string);
  const description = formData.get('description') as string;

  if (!targetAmount || targetAmount <= 0) return { success: false, message: 'Nominal target tidak valid.' };

  try {
    const { error } = await supabase.from('targets').insert([{
      group_id: session.group_id,
      period_type: periodType,
      target_amount: targetAmount,
      description: description || null
    }]);

    if (error) throw new Error('Gagal menyimpan target: ' + error.message);

    revalidatePath('/admin');
    revalidatePath('/admin/target');
    
    return { success: true };
  } catch (err: any) {
    console.error('Target Error:', err);
    return { success: false, message: err.message };
  }
}