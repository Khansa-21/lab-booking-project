import { BrevoClient } from '@getbrevo/brevo';

import { environment } from '../config/environment.js';

const client = new BrevoClient({
  apiKey: environment.email.brevoApiKey,
  timeoutInSeconds: 20,
  maxRetries: 1,
});

export async function sendPasswordResetEmail(input: {
  name: string;
  email: string;
  resetUrl: string;
}): Promise<void> {
  await client.transactionalEmails.sendTransacEmail({
    sender: { name: environment.email.fromName, email: environment.email.from },
    to: [{ name: input.name, email: input.email }],
    subject: 'Reset your University Resource Hub password',
    htmlContent: `<p>Hello ${escapeHtml(input.name)},</p><p>Use the link below to reset your password. It expires in 15 minutes.</p><p><a href="${input.resetUrl}">Reset password</a></p><p>If you did not request this, you can safely ignore this email.</p>`,
  });
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>'"]/g, (character) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;',
  })[character] ?? character);
}
