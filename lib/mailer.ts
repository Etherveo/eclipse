import nodemailer from 'nodemailer';

export const sendEmailOTP = async (to: string, otp: string) => {
  // Gunakan Fallback Operator (||) biar otomatis mendeteksi nama variabel yang lu pakai di .env.local
  const userEmail = process.env.SMTP_EMAIL || process.env.EMAIL_USER;
  const userPass = process.env.SMTP_PASSWORD || process.env.EMAIL_PASS;

  // Pindahkan transporter ke DALAM fungsi agar process.env selalu terbaca saat runtime (bukan saat awal import)
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true, // Pakai SSL
    auth: {
      user: userEmail,
      pass: userPass,
    },
  });

  const mailOptions = {
    from: `"Kas Eclipse" <${userEmail}>`,
    to,
    subject: 'Kode OTP Verifikasi - Kas Eclipse',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 400px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
        <h2 style="color: #333;">Verifikasi Email Anda</h2>
        <p style="color: #555;">Gunakan kode OTP 6-digit di bawah ini untuk memverifikasi akun Anda. Kode ini hanya berlaku selama <strong>10 menit</strong>.</p>
        <div style="background-color: #f4f4f5; padding: 15px; text-align: center; border-radius: 8px; margin: 20px 0;">
          <h1 style="margin: 0; letter-spacing: 5px; color: #4f46e5;">${otp}</h1>
        </div>
        <p style="color: #999; font-size: 12px;">Jika Anda tidak merasa mendaftar di sistem ini, abaikan pesan ini.</p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};