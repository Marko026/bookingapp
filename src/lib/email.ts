"use server";

import { Resend } from "resend";
import { env } from "@/env";
import { sanitizeErrorForProduction } from "@/lib/error-handling";
import { logError } from "@/lib/logger";
import { createBookingEmail } from "./emails/admin-notification";
import { createGuestApprovalEmail } from "./emails/guest-approval-email";
import { createGuestCancellationEmail } from "./emails/guest-cancellation-email";
import { createGuestConfirmationEmail } from "./emails/guest-confirmation";
import { createInquiryEmail } from "./emails/inquiry-email";
import type { BookingData } from "./emails/types";
import type { InquiryData } from "./emails/inquiry-email";

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
			const errorMsg = typeof adminResult.error === "object" && adminResult.error !== null && "message" in adminResult.error 
				? String((adminResult.error as {message: string}).message) 
				: JSON.stringify(adminResult.error);
			console.error("Resend admin email error:", errorMsg);
			logError(errorMsg, {
				action: "sendBookingEmails",
				path: "/api/booking",
				metadata: { recipient: "admin", bookingId: bookingData.apartmentName },
			});
			throw new Error(`Admin email failed: ${errorMsg}`);
		}

		if (guestResult.error) {
			const errorMsg = typeof guestResult.error === "object" && guestResult.error !== null && "message" in guestResult.error 
				? String((guestResult.error as {message: string}).message) 
				: JSON.stringify(guestResult.error);
			console.error("Resend guest email error:", errorMsg);
			logError(errorMsg, {
				action: "sendBookingEmails",
				path: "/api/booking",
				metadata: { recipient: "guest", bookingId: bookingData.apartmentName },
			});
			throw new Error(`Guest email failed: ${errorMsg}`);
		}

		return {
			success: true,
			adminEmailId: adminResult.data?.id,
			guestEmailId: guestResult.data?.id,
		};
	} catch (error) {
		logError(error, {
			action: "sendBookingEmails",
			path: "/api/booking",
			metadata: { bookingId: bookingData.apartmentName },
		});
		return {
			success: false,
			error: sanitizeErrorForProduction(error),
		};
	}
}

export async function sendApprovalEmail(bookingData: BookingData) {
	const fromEmail = `Apartmani Todorović <${env.RESEND_FROM_EMAIL}>`;

	try {
		const result = await resend.emails.send({
			from: fromEmail,
			to: bookingData.guestEmail,
			subject: `Booking Confirmed / Rezervacija Potvrđena - ${bookingData.apartmentName}`,
			html: createGuestApprovalEmail(bookingData),
		});

		if (result.error) {
			const errorMsg = typeof result.error === "object" && result.error !== null && "message" in result.error 
				? String((result.error as {message: string}).message) 
				: JSON.stringify(result.error);
			console.error("Resend approval email error:", errorMsg);
			logError(errorMsg, {
				action: "sendApprovalEmail",
				path: "/admin/bookings",
				metadata: { recipient: "guest", bookingId: bookingData.apartmentName },
			});
			throw new Error(`Approval email failed: ${errorMsg}`);
		}

		return {
			success: true,
			emailId: result.data?.id,
		};
	} catch (error) {
		logError(error, {
			action: "sendApprovalEmail",
			path: "/admin/bookings",
			metadata: { bookingId: bookingData.apartmentName },
		});
		return {
			success: false,
			error: sanitizeErrorForProduction(error),
		};
	}
}

export async function sendCancellationEmail(bookingData: BookingData) {
	const fromEmail = `Apartmani Todorović <${env.RESEND_FROM_EMAIL}>`;

	try {
		const result = await resend.emails.send({
			from: fromEmail,
			to: bookingData.guestEmail,
			subject: `Booking Cancelled / Rezervacija Otkazana - ${bookingData.apartmentName}`,
			html: createGuestCancellationEmail(bookingData),
		});

		if (result.error) {
			const errorMsg = typeof result.error === "object" && result.error !== null && "message" in result.error 
				? String((result.error as {message: string}).message) 
				: JSON.stringify(result.error);
			console.error("Resend cancellation email error:", errorMsg);
			logError(errorMsg, {
				action: "sendCancellationEmail",
				path: "/admin/bookings",
				metadata: { recipient: "guest", bookingId: bookingData.apartmentName },
			});
			throw new Error(`Cancellation email failed: ${errorMsg}`);
		}

		return {
			success: true,
			emailId: result.data?.id,
		};
	} catch (error) {
		logError(error, {
			action: "sendCancellationEmail",
			path: "/admin/bookings",
			metadata: { bookingId: bookingData.apartmentName },
		});
		return {
			success: false,
			error: sanitizeErrorForProduction(error),
		};
	}
}

export async function sendInquiryEmail(inquiryData: InquiryData) {
	const adminEmail = env.ADMIN_EMAIL_1;
	const fromEmail = `Apartmani Todorović <${env.RESEND_FROM_EMAIL}>`;

	try {
		const result = await resend.emails.send({
			from: fromEmail,
			to: adminEmail,
			replyTo: inquiryData.email,
			subject: `Nova Poruka od ${inquiryData.name}`,
			html: createInquiryEmail(inquiryData),
		});

		if (result.error) {
			const errorMsg = typeof result.error === "object" && result.error !== null && "message" in result.error 
				? String((result.error as {message: string}).message) 
				: JSON.stringify(result.error);
			console.error("Resend inquiry email error:", errorMsg);
			logError(errorMsg, {
				action: "sendInquiryEmail",
				path: "/contact",
				metadata: { recipient: "admin", from: inquiryData.email },
			});
			throw new Error(`Inquiry email failed: ${errorMsg}`);
		}

		return {
			success: true,
			emailId: result.data?.id,
		};
	} catch (error) {
		logError(error, {
			action: "sendInquiryEmail",
			path: "/contact",
			metadata: { from: inquiryData.email },
		});
		return {
			success: false,
			error: sanitizeErrorForProduction(error),
		};
	}
}
