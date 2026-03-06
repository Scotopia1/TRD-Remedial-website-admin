// Email utility for contact form notifications
// Uses nodemailer with SMTP transport

import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

const FROM_ADDRESS = process.env.SMTP_FROM || 'noreply@trdremedial.com.au'
const ADMIN_EMAIL = process.env.ADMIN_NOTIFICATION_EMAIL || 'info@trdremedial.com.au'

/**
 * Shared HTML email wrapper with TRD branding
 */
function emailWrapper(content: string): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>TRD Remedial</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f5f5f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width: 600px; width: 100%;">
          <!-- Header -->
          <tr>
            <td style="background-color: #1a1a1a; padding: 30px 40px; border-radius: 12px 12px 0 0;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td>
                    <div style="display: inline-block; background-color: #ffffff; border-radius: 6px; padding: 6px 12px; margin-bottom: 8px;">
                      <span style="color: #1a1a1a; font-weight: 700; font-size: 16px; letter-spacing: 2px;">TRD</span>
                    </div>
                    <p style="color: #a0a0a0; font-size: 13px; margin: 8px 0 0 0; letter-spacing: 0.5px;">
                      The Remedial Experts
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="background-color: #ffffff; padding: 40px;">
              ${content}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background-color: #1a1a1a; padding: 24px 40px; border-radius: 0 0 12px 12px;">
              <p style="color: #666666; font-size: 12px; margin: 0; line-height: 1.6;">
                TRD Remedial &mdash; The Remedial Experts<br>
                <a href="https://www.trdremedial.com.au" style="color: #888888; text-decoration: none;">www.trdremedial.com.au</a>
              </p>
              <p style="color: #444444; font-size: 11px; margin: 12px 0 0 0;">
                This is an automated email. Please do not reply directly to this message.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}

/**
 * Send confirmation email to the person who submitted the contact form.
 * Fire-and-forget: errors are logged but do not propagate.
 */
export async function sendContactConfirmation(to: string, name: string): Promise<void> {
  if (!process.env.SMTP_USER) {
    console.warn('[email] SMTP_USER not configured, skipping confirmation email')
    return
  }

  try {
    const html = emailWrapper(`
      <h1 style="color: #1a1a1a; font-size: 22px; margin: 0 0 20px 0; font-weight: 600;">
        Thank you for contacting us, ${name}
      </h1>
      <p style="color: #444444; font-size: 15px; line-height: 1.7; margin: 0 0 16px 0;">
        We have received your enquiry and appreciate you reaching out to TRD Remedial.
        Our team will review your message and get back to you within <strong>24 hours</strong>.
      </p>
      <p style="color: #444444; font-size: 15px; line-height: 1.7; margin: 0 0 24px 0;">
        If your matter is urgent, please don't hesitate to contact us directly:
      </p>
      <table role="presentation" cellpadding="0" cellspacing="0" style="margin-bottom: 24px;">
        <tr>
          <td style="padding: 12px 20px; background-color: #f8f8f8; border-radius: 8px;">
            <p style="margin: 0; color: #1a1a1a; font-size: 14px; line-height: 1.8;">
              <strong>Phone:</strong> 1300 TRD (1300 873)<br>
              <strong>Email:</strong> <a href="mailto:info@trdremedial.com.au" style="color: #1a1a1a;">info@trdremedial.com.au</a><br>
              <strong>Website:</strong> <a href="https://www.trdremedial.com.au" style="color: #1a1a1a;">www.trdremedial.com.au</a>
            </p>
          </td>
        </tr>
      </table>
      <p style="color: #888888; font-size: 13px; margin: 0;">
        We look forward to discussing how we can help with your remedial needs.
      </p>
    `)

    await transporter.sendMail({
      from: `"TRD Remedial" <${FROM_ADDRESS}>`,
      to,
      subject: 'Thank you for contacting TRD Remedial',
      html,
    })

    console.log(`[email] Confirmation sent to ${to}`)
  } catch (error) {
    console.error('[email] Failed to send confirmation:', error)
  }
}

interface SubmissionData {
  id: string
  name: string
  email: string
  phone?: string | null
  company?: string | null
  serviceInterest?: string | null
  projectType?: string | null
  message: string
  createdAt: Date
}

/**
 * Send notification email to admin about a new contact form submission.
 * Fire-and-forget: errors are logged but do not propagate.
 */
export async function sendAdminNotification(submission: SubmissionData): Promise<void> {
  if (!process.env.SMTP_USER) {
    console.warn('[email] SMTP_USER not configured, skipping admin notification')
    return
  }

  try {
    const optionalRows = [
      submission.phone && `
        <tr>
          <td style="padding: 10px 16px; color: #888888; font-size: 13px; font-weight: 600; vertical-align: top; width: 140px;">Phone</td>
          <td style="padding: 10px 16px; color: #1a1a1a; font-size: 14px;">${submission.phone}</td>
        </tr>`,
      submission.company && `
        <tr>
          <td style="padding: 10px 16px; color: #888888; font-size: 13px; font-weight: 600; vertical-align: top; width: 140px;">Company</td>
          <td style="padding: 10px 16px; color: #1a1a1a; font-size: 14px;">${submission.company}</td>
        </tr>`,
      submission.serviceInterest && `
        <tr>
          <td style="padding: 10px 16px; color: #888888; font-size: 13px; font-weight: 600; vertical-align: top; width: 140px;">Service Interest</td>
          <td style="padding: 10px 16px; color: #1a1a1a; font-size: 14px;">${submission.serviceInterest}</td>
        </tr>`,
      submission.projectType && `
        <tr>
          <td style="padding: 10px 16px; color: #888888; font-size: 13px; font-weight: 600; vertical-align: top; width: 140px;">Project Type</td>
          <td style="padding: 10px 16px; color: #1a1a1a; font-size: 14px;">${submission.projectType}</td>
        </tr>`,
    ].filter(Boolean).join('')

    const html = emailWrapper(`
      <h1 style="color: #1a1a1a; font-size: 22px; margin: 0 0 8px 0; font-weight: 600;">
        New Contact Form Submission
      </h1>
      <p style="color: #888888; font-size: 13px; margin: 0 0 24px 0;">
        Received on ${submission.createdAt.toLocaleDateString('en-AU', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        at ${submission.createdAt.toLocaleTimeString('en-AU', { hour: '2-digit', minute: '2-digit' })}
      </p>

      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border: 1px solid #e5e5e5; border-radius: 8px; overflow: hidden; margin-bottom: 24px;">
        <tr style="background-color: #f8f8f8;">
          <td style="padding: 10px 16px; color: #888888; font-size: 13px; font-weight: 600; vertical-align: top; width: 140px;">Name</td>
          <td style="padding: 10px 16px; color: #1a1a1a; font-size: 14px; font-weight: 600;">${submission.name}</td>
        </tr>
        <tr>
          <td style="padding: 10px 16px; color: #888888; font-size: 13px; font-weight: 600; vertical-align: top; width: 140px;">Email</td>
          <td style="padding: 10px 16px; color: #1a1a1a; font-size: 14px;">
            <a href="mailto:${submission.email}" style="color: #1a1a1a;">${submission.email}</a>
          </td>
        </tr>
        ${optionalRows}
        <tr style="background-color: #f8f8f8;">
          <td colspan="2" style="padding: 10px 16px; color: #888888; font-size: 13px; font-weight: 600;">Message</td>
        </tr>
        <tr>
          <td colspan="2" style="padding: 16px; color: #1a1a1a; font-size: 14px; line-height: 1.7;">
            ${submission.message.replace(/\n/g, '<br>')}
          </td>
        </tr>
      </table>

      <table role="presentation" cellpadding="0" cellspacing="0">
        <tr>
          <td style="padding: 12px 24px; background-color: #1a1a1a; border-radius: 8px;">
            <a href="mailto:${submission.email}?subject=Re: Your enquiry to TRD Remedial"
               style="color: #ffffff; text-decoration: none; font-size: 14px; font-weight: 600;">
              Reply to ${submission.name}
            </a>
          </td>
        </tr>
      </table>
    `)

    await transporter.sendMail({
      from: `"TRD Remedial Admin" <${FROM_ADDRESS}>`,
      to: ADMIN_EMAIL,
      subject: `New Contact Form Submission from ${submission.name}`,
      html,
    })

    console.log(`[email] Admin notification sent for submission ${submission.id}`)
  } catch (error) {
    console.error('[email] Failed to send admin notification:', error)
  }
}
