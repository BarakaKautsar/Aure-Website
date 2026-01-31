// lib/email.ts
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_EMAIL =
  process.env.RESEND_FROM_EMAIL || "Aure Pilates <onboarding@resend.dev>";

// Email Templates in Indonesian

export async function sendBookingConfirmation({
  to,
  userName,
  className,
  date,
  time,
  coach,
  location,
}: {
  to: string;
  userName: string;
  className: string;
  date: string;
  time: string;
  coach: string;
  location: string;
}) {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #2E3A4A; color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
          .card { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .detail-row { display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #eee; }
          .detail-label { font-weight: 600; color: #666; }
          .detail-value { color: #2E3A4A; font-weight: 500; }
          .button { display: inline-block; background: #2E3A4A; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; margin: 20px 0; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✅ Booking Berhasil!</h1>
          </div>
          <div class="content">
            <p>Halo <strong>${userName}</strong>,</p>
            <p>Booking kelas Pilates Anda telah berhasil dikonfirmasi! Kami menunggu Anda di studio.</p>
            
            <div class="card">
              <h3 style="margin-top: 0; color: #2E3A4A;">Detail Kelas</h3>
              <div class="detail-row">
                <span class="detail-label">Kelas:</span>
                <span class="detail-value">${className}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Tanggal:</span>
                <span class="detail-value">${date}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Waktu:</span>
                <span class="detail-value">${time}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Instruktur:</span>
                <span class="detail-value">${coach}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Lokasi:</span>
                <span class="detail-value">${location}</span>
              </div>
            </div>

            <p><strong>Catatan Penting:</strong></p>
            <ul>
              <li>Datang 10 menit sebelum kelas dimulai</li>
              <li>Bawa pakaian olahraga yang nyaman</li>
              <li>Bawa handuk dan botol minum</li>
              <li>Jika perlu membatalkan, harap beritahu kami minimal 4 jam sebelumnya</li>
            </ul>

            <center>
              <a href="${process.env.NEXT_PUBLIC_APP_URL}/account?tab=manage-booking" class="button">
                Lihat Booking Saya
              </a>
            </center>
          </div>
          <div class="footer">
            <p>Aure Pilates Studio Tasikmalaya</p>
            <p>Jl. Sutisna Senjaya No.57, Empangsari</p>
            <p>WhatsApp: +62 813-7025-1119</p>
          </div>
        </div>
      </body>
    </html>
  `;

  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: "✅ Booking Kelas Berhasil - Aure Pilates",
      html,
    });

    if (error) {
      console.error("Error sending booking confirmation:", error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    console.error("Error sending email:", error);
    return { success: false, error };
  }
}

export async function sendCancellationConfirmation({
  to,
  userName,
  className,
  date,
  time,
}: {
  to: string;
  userName: string;
  className: string;
  date: string;
  time: string;
}) {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #DC2626; color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
          .card { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .button { display: inline-block; background: #2E3A4A; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; margin: 20px 0; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>❌ Booking Dibatalkan</h1>
          </div>
          <div class="content">
            <p>Halo <strong>${userName}</strong>,</p>
            <p>Booking kelas Pilates Anda telah berhasil dibatalkan.</p>
            
            <div class="card">
              <h3 style="margin-top: 0;">Detail Kelas yang Dibatalkan</h3>
              <p><strong>Kelas:</strong> ${className}</p>
              <p><strong>Tanggal:</strong> ${date}</p>
              <p><strong>Waktu:</strong> ${time}</p>
            </div>

            <p>Kredit paket Anda telah dikembalikan. Anda dapat menggunakan kredit ini untuk booking kelas lain.</p>

            <center>
              <a href="${process.env.NEXT_PUBLIC_APP_URL}/#schedule" class="button">
                Lihat Jadwal Kelas
              </a>
            </center>
          </div>
          <div class="footer">
            <p>Aure Pilates Studio Tasikmalaya</p>
            <p>WhatsApp: +62 813-7025-1119</p>
          </div>
        </div>
      </body>
    </html>
  `;

  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: "❌ Pembatalan Booking Dikonfirmasi - Aure Pilates",
      html,
    });

    if (error) {
      console.error("Error sending cancellation:", error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    console.error("Error sending email:", error);
    return { success: false, error };
  }
}

export async function sendClassReminder({
  to,
  userName,
  className,
  date,
  time,
  coach,
  location,
}: {
  to: string;
  userName: string;
  className: string;
  date: string;
  time: string;
  coach: string;
  location: string;
}) {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #F59E0B; color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
          .card { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .highlight { background: #FEF3C7; padding: 15px; border-left: 4px solid #F59E0B; margin: 20px 0; border-radius: 4px; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>⏰ Pengingat Kelas Besok!</h1>
          </div>
          <div class="content">
            <p>Halo <strong>${userName}</strong>,</p>
            <p>Ini adalah pengingat untuk kelas Pilates Anda besok.</p>
            
            <div class="card">
              <h3 style="margin-top: 0; color: #2E3A4A;">Detail Kelas Anda</h3>
              <p><strong>Kelas:</strong> ${className}</p>
              <p><strong>Tanggal:</strong> ${date}</p>
              <p><strong>Waktu:</strong> ${time}</p>
              <p><strong>Instruktur:</strong> ${coach}</p>
              <p><strong>Lokasi:</strong> ${location}</p>
            </div>

            <div class="highlight">
              <strong>🎒 Jangan Lupa Bawa:</strong>
              <ul style="margin: 10px 0;">
                <li>Pakaian olahraga yang nyaman</li>
                <li>Handuk</li>
                <li>Botol minum</li>
              </ul>
            </div>

            <p style="color: #DC2626;"><strong>⚠️ Perhatian:</strong> Jika Anda perlu membatalkan, mohon beritahu kami minimal 4 jam sebelumnya agar kredit paket Anda dapat dikembalikan.</p>
          </div>
          <div class="footer">
            <p>Sampai jumpa besok!</p>
            <p>Aure Pilates Studio Tasikmalaya</p>
            <p>WhatsApp: +62 813-7025-1119</p>
          </div>
        </div>
      </body>
    </html>
  `;

  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: "⏰ Pengingat: Kelas Besok - Aure Pilates",
      html,
    });

    if (error) {
      console.error("Error sending reminder:", error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    console.error("Error sending email:", error);
    return { success: false, error };
  }
}

export async function sendWelcomeEmail({
  to,
  userName,
}: {
  to: string;
  userName: string;
}) {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #2E3A4A; color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
          .card { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .button { display: inline-block; background: #2E3A4A; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; margin: 10px; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Selamat Datang di Aure Pilates!</h1>
          </div>
          <div class="content">
            <p>Halo <strong>${userName}</strong>,</p>
            <p>Terima kasih telah bergabung dengan Aure Pilates Studio! Kami sangat senang Anda menjadi bagian dari komunitas kami.</p>
            
            <div class="card">
              <h3 style="margin-top: 0; color: #2E3A4A;">Langkah Selanjutnya:</h3>
              <ol>
                <li><strong>Lihat Jadwal Kelas</strong> - Pilih kelas yang sesuai dengan jadwal Anda</li>
                <li><strong>Beli Paket</strong> - Dapatkan harga lebih hemat dengan paket kelas</li>
                <li><strong>Booking Kelas Pertama</strong> - Mulai perjalanan Pilates Anda!</li>
              </ol>
            </div>

            <center>
              <a href="${process.env.NEXT_PUBLIC_APP_URL}/#schedule" class="button">
                Lihat Jadwal
              </a>
              <a href="${process.env.NEXT_PUBLIC_APP_URL}/#packages" class="button">
                Lihat Paket
              </a>
            </center>

            <p style="margin-top: 30px;">Jika Anda memiliki pertanyaan, jangan ragu untuk menghubungi kami via WhatsApp di <strong>+62 813-7025-1119</strong></p>
          </div>
          <div class="footer">
            <p>Sampai jumpa di studio!</p>
            <p>Aure Pilates Studio Tasikmalaya</p>
            <p>Jl. Sutisna Senjaya No.57, Empangsari</p>
          </div>
        </div>
      </body>
    </html>
  `;

  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: "🎉 Selamat Datang di Aure Pilates!",
      html,
    });

    if (error) {
      console.error("Error sending welcome email:", error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    console.error("Error sending email:", error);
    return { success: false, error };
  }
}

export async function sendPasswordResetEmail({
  to,
  userName,
  resetToken,
}: {
  to: string;
  userName: string;
  resetToken: string;
}) {
  const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${resetToken}`;

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #2E3A4A; color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
          .card { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .button { display: inline-block; background: #2E3A4A; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; margin: 20px 0; }
          .warning { background: #FEF3C7; padding: 15px; border-left: 4px solid #F59E0B; margin: 20px 0; border-radius: 4px; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔐 Reset Password</h1>
          </div>
          <div class="content">
            <p>Halo <strong>${userName}</strong>,</p>
            <p>Kami menerima permintaan untuk mereset password akun Anda di Aure Pilates Studio.</p>
            
            <div class="card">
              <p>Klik tombol di bawah ini untuk membuat password baru:</p>
              <center>
                <a href="${resetUrl}" class="button">
                  Reset Password
                </a>
              </center>
              <p style="margin-top: 20px; font-size: 14px; color: #666;">
                Atau salin link ini ke browser Anda:<br>
                <a href="${resetUrl}" style="color: #2E3A4A; word-break: break-all;">${resetUrl}</a>
              </p>
            </div>

            <div class="warning">
              <strong>⚠️ Penting:</strong>
              <ul style="margin: 10px 0;">
                <li>Link ini akan kadaluarsa dalam <strong>1 jam</strong></li>
                <li>Jika Anda tidak meminta reset password, abaikan email ini</li>
                <li>Jangan bagikan link ini kepada siapa pun</li>
              </ul>
            </div>

            <p>Jika Anda mengalami kesulitan, hubungi kami di WhatsApp: <strong>+62 813-7025-1119</strong></p>
          </div>
          <div class="footer">
            <p>Aure Pilates Studio Tasikmalaya</p>
            <p>Jl. Sutisna Senjaya No.57, Empangsari</p>
          </div>
        </div>
      </body>
    </html>
  `;

  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: "🔐 Reset Password - Aure Pilates",
      html,
    });

    if (error) {
      console.error("Error sending password reset email:", error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    console.error("Error sending email:", error);
    return { success: false, error };
  }
}
