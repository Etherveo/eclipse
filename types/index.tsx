export type UserSession = {
  id: string;
  group_id: string | null;
  username: string;
  role: 'developer' | 'admin' | 'anggota';
  name: string;
  title: string | null; // Tambahan wajib untuk ngecek jabatan Ketua
  approval_status: 'pending' | 'approved' | 'rejected';
  email_verified: boolean;
};

export interface Transaction {
  id: string;
  group_id: string;
  user_id: string | null;
  user_snapshot: { username: string; full_name: string } | null;
  type: 'income' | 'outcome';
  amount: number;
  payment_method: 'cash' | 'transfer';
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  proof_image_url: string | null;
  notes: string | null;
  created_at: string;
  users?: { name?: string; full_name?: string };
}

export type Target = {
  id: string;
  period_type: 'harian' | 'mingguan' | 'bulanan' | 'semester';
  target_amount: number;
  description: string | null;
  created_at: string;
};