"use server";

import { Resend } from "resend";
import { env } from "@/env";
import { createBookingEmail } from "./emails/admin-notification";
import { createGuestConfirmationEmail } from "./emails/guest-confirmation";
import type { BookingData } from "./emails/types";

const resend = new Resend(env.RESEND_API_KEY);

export async function sendBookingEmails(bookingData: BookingData) {
	const adminEmail = env.ADMIN_EMAIL_1;

	const fromEmail = `Apartmani Todorović <${env.RESEND_FROM_EMAIL}>`;

	try {
		const adminEmailPromise = resend.emails.send({
			from: fromEmail,
			to: adminEmail,
			replyTo: bookingData.guestEmail,
			subject: `Nova Rezervacija - ${bookingData.apartmentName}`,
			html: createBookingEmail(bookingData),
		});

		const guestEmailPromise = resend.emails.send({
			from: fromEmail,
			to: bookingData.guestEmail,
			subject: `Potvrda Rezervacije - ${bookingData.apartmentName}`,
			html: createGuestConfirmationEmail(bookingData),
		});

		const [adminResult, guestResult] = await Promise.all([
			adminEmailPromise,
			guestEmailPromise,
		]);

		if (adminResult.error) {
			console.error("Admin email error:", adminResult.error);
			throw new Error(`Admin email failed: ${adminResult.error.message}`);
		}

		if (guestResult.error) {
			console.error("Guest confirmation email error:", guestResult.error);
		}

		return {
			success: true,
			adminEmailId: adminResult.data?.id,
			guestEmailId: guestResult.data?.id,
		};
	} catch (error) {
		console.error("Email sending error:", error);
		return {
			success: false,
			error: error instanceof Error ? error.message : "Unknown error",
		};
	}
}
