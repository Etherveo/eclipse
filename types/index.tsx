export type UserSession = {
  id: string;
  username: string;
  role: 'admin' | 'user';
  name: string;
  title: string | null;
};

export type Transaction = {
  id: string;
  user_id: string;
  type: 'income' | 'outcome';
  amount: number;
  payment_method: 'cash' | 'transfer';
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  proof_image_url: string | null;
  notes: string | null;
  created_at: string;
  users?: { // Untuk relasi JOIN dengan tabel users
    name: string;
  };
};

export type Target = {
  id: string;
  period_type: 'harian' | 'mingguan' | 'bulanan' | 'semester';
  target_amount: number;
  description: string | null;
  created_at: string;
};