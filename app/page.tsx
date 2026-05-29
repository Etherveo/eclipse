import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { UserSession } from '@/types';

export default async function RootRedirector() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('session_kas');

  // Kalau belum login, lempar ke halaman login
  if (!sessionCookie) {
    redirect('/login');
  }

  let user: UserSession;

  try {
    // try-catch HANYA untuk nge-parse JSON
    user = JSON.parse(sessionCookie.value);
  } catch (error) {
    // Kalau cookie corrupt/berantakan
    redirect('/login');
  }

  // Anggota WAJIB masukin ID Kelompok dulu sebelum nunggu persetujuan
  if (user.role === 'anggota' && !user.group_id) {
    redirect('/onboarding');
  }

  // 1. Cek Status Approval Terlebih Dahulu
  if (user.approval_status === 'pending') {
    redirect('/pending'); 
  } else if (user.approval_status === 'rejected') {
    redirect('/rejected'); 
  }

  // 1.5 Cek Verifikasi Email Khusus Admin
  if (user.role === 'admin' && !user.email_verified) {
    redirect('/verify-email');
  }

  // 1.6 Cek Apakah Sudah Punya Kelompok (Kecuali Developer)
  if (user.role !== 'developer' && !user.group_id) {
    redirect('/onboarding'); // Lempar ke halaman pembuatan/join kelas
  }

  // 2. Arahkan ke dashboard masing-masing sesuai role
  if (user.role === 'developer') {
    redirect('/dev');
  } else if (user.role === 'admin') {
    redirect('/admin');
  } else {
    redirect('/user');
  }
}