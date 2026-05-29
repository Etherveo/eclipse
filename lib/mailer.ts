import nodemailer from 'nodemailer';

export const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true, // Pakai SSL
  auth: {
    user: process.env.SMTP_EMAIL,
    pass: process.env.SMTP_PASSWORD,
  },
});

export const sendEmailOTP = async (to: string, otp: string) => {
  const mailOptions = {
    from: `"Kas Eclipse" <${process.env.SMTP_EMAIL}>`,
    to,
    subject: 'Kode OTP Verifikasi - Kas Eclipse',
    html: `
      <div style="font-family: Arial, sans-serif; max-w: 400px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
        <h2 style="color: #333;">Verifikasi Email Anda</h2>
        <p style="color: #555;">Gunakan kode OTP 6-digit di bawah ini untuk memverifikasi akun Anda. Kode ini hanya berlaku selama <strong>10 menit</strong>.</p>
        <div style="background-color: #f4f4f5; padding: 15px; text-align: center; border-radius: 8px; margin: 20px 0;">
          <h1 style="margin: 0; letter-spacing: 5px; color: #4f46e5;">${otp}</h1>
        </div>
        <p style="color: #999; font-size: 12px;">Jika Anda tidak merasa meminta kode ini, abaikan email ini.</p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};