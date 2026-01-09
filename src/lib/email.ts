'use server';

import { env } from '@/env';
import { Resend } from 'resend';
import { createBookingEmail } from './emails/admin-notification';
import type { BookingData } from './emails/types';

const resend = new Resend(env.RESEND_API_KEY);

export async function sendBookingEmails(bookingData: BookingData) {
  // U test modu Resend naloga smeš da šalješ samo na svoj email.
  // Zato rezervacije trenutno idu SAMO na NEXT_PUBLIC_ADMIN_EMAIL_1 (tvoj Gmail).
  const adminEmail = env.NEXT_PUBLIC_ADMIN_EMAIL_1;

  // Use verified email from environment for production delivery
  const fromEmail = `Apartmani Todorović <${env.RESEND_FROM_EMAIL}>`;

  try {
    const adminEmailPromise = resend.emails.send({
      from: fromEmail,
      to: adminEmail,
      // Reply ide direktno na email koji je gost uneo u formu,
      // tako da i dalje možeš da mu odgovoriš jednim klikom.
      replyTo: bookingData.guestEmail,
      subject: `Nova Rezervacija - ${bookingData.apartmentName}`,
      html: createBookingEmail(bookingData),
    });

    const adminResult = await adminEmailPromise;

    if (adminResult.error) {
      console.error('❌ Admin email error:', adminResult.error);
      throw new Error(`Admin email failed: ${adminResult.error.message}`);
    }

    console.log('✅ Emails sent successfully:', {
      adminEmailId: adminResult.data?.id,
      from: fromEmail,
      to: {
        guest: bookingData.guestEmail,
        admin: adminEmail,
      },
    });

    return {
      success: true,
      adminEmailId: adminResult.data?.id,
    };
  } catch (error) {
    console.error('❌ Email sending error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
