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

function getResendErrorMessage(error: unknown): string {
	if (typeof error === "object" && error !== null && "message" in error) {
		return String((error as {message: string}).message);
	}
	return JSON.stringify(error);
}

export async function sendBookingEmails(bookingData: BookingData) {
	const adminEmails = [env.ADMIN_EMAIL_1, env.ADMIN_EMAIL_2].filter(
		(e): e is string => Boolean(e),
	);
	const fromEmail = `Apartmani Todorović <${env.RESEND_FROM_EMAIL}>`;

	// Send admin emails individually so one failure doesn't block the other
	const adminResults: Array<{ email: string; id?: string; error?: string }> = [];
	for (const email of adminEmails) {
		try {
			const result = await resend.emails.send({
				from: fromEmail,
				to: email,
				replyTo: bookingData.guestEmail,
				subject: `Nova Rezervacija - ${bookingData.apartmentName}`,
				html: createBookingEmail(bookingData),
			});

			if (result.error) {
				const errorMsg = getResendErrorMessage(result.error);
				console.error(`Resend email error for ${email}:`, errorMsg);
				logError(errorMsg, {
					action: "sendBookingEmails",
					path: "/api/booking",
					metadata: { recipient: email, bookingId: bookingData.apartmentName },
				});
				adminResults.push({ email, error: errorMsg });
			} else {
				adminResults.push({ email, id: result.data?.id });
			}
		} catch (error) {
			console.error(`Resend email exception for ${email}:`, error);
			logError(error, {
				action: "sendBookingEmails",
				path: "/api/booking",
				metadata: { recipient: email, bookingId: bookingData.apartmentName },
			});
			adminResults.push({ email, error: String(error) });
		}
	}

	// Send guest confirmation (will likely fail with onboarding@resend.dev, but try anyway)
	let guestResult;
	try {
		guestResult = await resend.emails.send({
			from: fromEmail,
			to: bookingData.guestEmail,
			subject: `Potvrda Rezervacije - ${bookingData.apartmentName}`,
			html: createGuestConfirmationEmail(bookingData),
		});

		if (guestResult.error) {
			const errorMsg = getResendErrorMessage(guestResult.error);
			console.error("Resend guest email error:", errorMsg);
			logError(errorMsg, {
				action: "sendBookingEmails",
				path: "/api/booking",
				metadata: { recipient: "guest", bookingId: bookingData.apartmentName },
			});
		}
	} catch (error) {
		logError(error, {
			action: "sendBookingEmails",
			path: "/api/booking",
			metadata: { recipient: "guest", bookingId: bookingData.apartmentName },
		});
	}

	const anyAdminSent = adminResults.some((r) => r.id);
	const allFailed = adminResults.length > 0 && adminResults.every((r) => r.error);

	if (anyAdminSent) {
		return {
			success: true,
			adminResults,
			guestEmailId: guestResult && !guestResult.error ? guestResult.data?.id : undefined,
			guestEmailSkipped: guestResult && guestResult.error ? true : undefined,
		};
	}

	if (allFailed) {
		console.error("All admin emails failed:", adminResults.map((r) => r.error).join(", "));
	}

	return {
		success: anyAdminSent,
		adminResults,
		guestEmailId: guestResult && !guestResult.error ? guestResult.data?.id : undefined,
	};
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
			const errorMsg = getResendErrorMessage(result.error);
			console.error("Resend approval email error:", errorMsg);
			logError(errorMsg, {
				action: "sendApprovalEmail",
				path: "/admin/bookings",
				metadata: { recipient: "guest", bookingId: bookingData.apartmentName },
			});
			// Return partial success - status is updated but email couldn't be sent
			return {
				success: true,
				message: "Status updated, but approval email could not be sent. Please verify a domain at resend.com/domains to send emails to guests.",
			};
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
			success: true,
			message: "Status updated, but approval email could not be sent due to an error.",
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
			const errorMsg = getResendErrorMessage(result.error);
			console.error("Resend cancellation email error:", errorMsg);
			logError(errorMsg, {
				action: "sendCancellationEmail",
				path: "/admin/bookings",
				metadata: { recipient: "guest", bookingId: bookingData.apartmentName },
			});
			return {
				success: true,
				message: "Status updated, but cancellation email could not be sent. Please verify a domain at resend.com/domains to send emails to guests.",
			};
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
			success: true,
			message: "Status updated, but cancellation email could not be sent due to an error.",
		};
	}
}

export async function sendInquiryEmail(inquiryData: InquiryData) {
	const adminEmails = [env.ADMIN_EMAIL_1, env.ADMIN_EMAIL_2].filter(
		(e): e is string => Boolean(e),
	);
	const fromEmail = `Apartmani Todorović <${env.RESEND_FROM_EMAIL}>`;

	// Send to each admin individually
	let anySuccess = false;
	const errors: string[] = [];

	for (const email of adminEmails) {
		try {
			const result = await resend.emails.send({
				from: fromEmail,
				to: email,
				replyTo: inquiryData.email,
				subject: `Nova Poruka od ${inquiryData.name}`,
				html: createInquiryEmail(inquiryData),
			});

			if (result.error) {
				const errorMsg = getResendErrorMessage(result.error);
				console.error(`Resend inquiry email error for ${email}:`, errorMsg);
				logError(errorMsg, {
					action: "sendInquiryEmail",
					path: "/contact",
					metadata: { recipient: email, from: inquiryData.email },
				});
				errors.push(errorMsg);
			} else {
				anySuccess = true;
			}
		} catch (error) {
			logError(error, {
				action: "sendInquiryEmail",
				path: "/contact",
				metadata: { recipient: email, from: inquiryData.email },
			});
			errors.push(String(error));
		}
	}

	if (anySuccess) {
		return { success: true };
	}

	const errorMsg = errors.join(", ");
	return {
		success: false,
		error: sanitizeErrorForProduction(errorMsg),
	};
}
