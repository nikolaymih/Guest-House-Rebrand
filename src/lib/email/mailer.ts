import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

interface ReservationEmailData {
  fullName: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
}

function buildEmailHtml(data: ReservationEmailData): string {
  return `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
      <h2 style="color: #3D3028; margin-bottom: 16px;">Ново запитване от сайта</h2>
      <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
        <tr>
          <td style="padding: 8px 12px; font-weight: 600; color: #5D4935; background: #F5EDE4; width: 120px;">Имена:</td>
          <td style="padding: 8px 12px; background: #FAFAF9;">${data.fullName}</td>
        </tr>
        <tr>
          <td style="padding: 8px 12px; font-weight: 600; color: #5D4935; background: #F5EDE4;">Имейл:</td>
          <td style="padding: 8px 12px;"><a href="mailto:${data.email}" style="color: #C4956A;">${data.email}</a></td>
        </tr>
        <tr>
          <td style="padding: 8px 12px; font-weight: 600; color: #5D4935; background: #F5EDE4;">Телефон:</td>
          <td style="padding: 8px 12px; background: #FAFAF9;">${data.phone}</td>
        </tr>
        <tr>
          <td style="padding: 8px 12px; font-weight: 600; color: #5D4935; background: #F5EDE4;">Относно:</td>
          <td style="padding: 8px 12px;">${data.subject}</td>
        </tr>
        <tr>
          <td style="padding: 8px 12px; font-weight: 600; color: #5D4935; background: #F5EDE4; vertical-align: top;">Съобщение:</td>
          <td style="padding: 8px 12px; background: #FAFAF9; white-space: pre-wrap;">${data.message}</td>
        </tr>
      </table>
    </div>
  `;
}

export async function sendReservationEmail(data: ReservationEmailData): Promise<void> {
  const receiver =
    process.env.NODE_ENV === "production"
      ? process.env.EMAIL_PROD_RECEIVER
      : process.env.EMAIL_DEV_RECEIVER;

  await transporter.sendMail({
    from: `"Становец" <${process.env.EMAIL_USER}>`,
    to: receiver,
    subject: `Ново запитване: ${data.subject}`,
    html: buildEmailHtml(data),
  });
}
