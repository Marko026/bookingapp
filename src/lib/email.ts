"use server";

import { MailerooClient, EmailAddress } from "maileroo-sdk";
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

const getMailerooClient = () => {
	if (!env.MAILEROO_API_KEY) {
		throw new Error("MAILEROO_API_KEY is not configured");
	}
	return new MailerooClient(env.MAILEROO_API_KEY);
};

function htmlToPlain(html: string): string {
	return html
		.replace(/<[^>]*>/g, "")
		.replace(/&nbsp;/g, " ")
		.replace(/&amp;/g, "&")
		.replace(/&lt;/g, "<")
		.replace(/&gt;/g, ">")
		.replace(/&quot;/g, '"')
		.trim();
}

function getMailerooErrorMessage(error: unknown): string {
	if (error instanceof Error) {
		return error.message;
	}
	return JSON.stringify(error);
}

export async function sendBookingEmails(bookingData: BookingData) {
	const adminEmail = env.ADMIN_EMAIL_1;
	const fromEmailAddress = env.MAILEROO_FROM_EMAIL || env.RESEND_FROM_EMAIL;

	if (!fromEmailAddress) {
		return { success: false, error: "No from email configured" };
	}

	let client: MailerooClient;
	try {
		client = getMailerooClient();
	} catch (error) {
		logError(error, { action: "sendBookingEmails", path: "/api/booking" });
		return { success: false, error: "Maileroo client not configured" };
	}

	const fromEmail = new EmailAddress(fromEmailAddress, "Apartmani Todorović");

	let adminResult;
	try {
		const adminEmailObj = new EmailAddress(adminEmail);
		adminResult = await client.sendBasicEmail({
			from: fromEmail,
			to: [adminEmailObj],
			reply_to: new EmailAddress(bookingData.guestEmail),
			subject: `Nova Rezervacija - ${bookingData.apartmentName}`,
			html: createBookingEmail(bookingData),
			plain: htmlToPlain(createBookingEmail(bookingData)),
		});
	} catch (error) {
		const errorMsg = getMailerooErrorMessage(error);
		console.error("Maileroo admin email error:", errorMsg);
		logError(error, {
			action: "sendBookingEmails",
			path: "/api/booking",
			metadata: { recipient: "admin", bookingId: bookingData.apartmentName },
		});
	}

	let guestResult;
	try {
		const guestEmailObj = new EmailAddress(bookingData.guestEmail);
		guestResult = await client.sendBasicEmail({
			from: fromEmail,
			to: [guestEmailObj],
			subject: `Potvrda Rezervacije - ${bookingData.apartmentName}`,
			html: createGuestConfirmationEmail(bookingData),
			plain: htmlToPlain(createGuestConfirmationEmail(bookingData)),
		});
	} catch (error) {
		const errorMsg = getMailerooErrorMessage(error);
		console.error("Maileroo guest email error:", errorMsg);
		logError(error, {
			action: "sendBookingEmails",
			path: "/api/booking",
			metadata: { recipient: "guest", bookingId: bookingData.apartmentName },
		});
	}

	if (adminResult) {
		return {
			success: true,
			adminEmailId: adminResult,
			guestEmailId: guestResult || undefined,
			guestEmailSkipped: guestResult ? false : true,
		};
	}

	return {
		success: false,
		error: "Došlo je do greške prilikom slanja emailova.",
	};
}

export async function sendApprovalEmail(bookingData: BookingData) {
	const fromEmailAddress = env.MAILEROO_FROM_EMAIL || env.RESEND_FROM_EMAIL;

	if (!fromEmailAddress) {
		return {
			success: true,
			message: "Status updated, but no from email configured.",
		};
	}

	let client: MailerooClient;
	try {
		client = getMailerooClient();
	} catch (error) {
		logError(error, { action: "sendApprovalEmail", path: "/admin/bookings" });
		return {
			success: true,
			message: "Status updated, but Maileroo is not configured.",
		};
	}

	try {
		const fromEmail = new EmailAddress(fromEmailAddress, "Apartmani Todorović");
		const guestEmail = new EmailAddress(bookingData.guestEmail);

		const result = await client.sendBasicEmail({
			from: fromEmail,
			to: [guestEmail],
			subject: `Booking Confirmed / Rezervacija Potvrđena - ${bookingData.apartmentName}`,
			html: createGuestApprovalEmail(bookingData),
			plain: htmlToPlain(createGuestApprovalEmail(bookingData)),
		});

		return {
			success: true,
			emailId: result,
		};
	} catch (error) {
		const errorMsg = getMailerooErrorMessage(error);
		console.error("Maileroo approval email error:", errorMsg);
		logError(error, {
			action: "sendApprovalEmail",
			path: "/admin/bookings",
			metadata: { bookingId: bookingData.apartmentName },
		});
		return {
			success: true,
			message: "Status updated, but approval email could not be sent.",
		};
	}
}

export async function sendCancellationEmail(bookingData: BookingData) {
	const fromEmailAddress = env.MAILEROO_FROM_EMAIL || env.RESEND_FROM_EMAIL;

	if (!fromEmailAddress) {
		return {
			success: true,
			message: "Status updated, but no from email configured.",
		};
	}

	let client: MailerooClient;
	try {
		client = getMailerooClient();
	} catch (error) {
		logError(error, { action: "sendCancellationEmail", path: "/admin/bookings" });
		return {
			success: true,
			message: "Status updated, but Maileroo is not configured.",
		};
	}

	try {
		const fromEmail = new EmailAddress(fromEmailAddress, "Apartmani Todorović");
		const guestEmail = new EmailAddress(bookingData.guestEmail);

		const result = await client.sendBasicEmail({
			from: fromEmail,
			to: [guestEmail],
			subject: `Booking Cancelled / Rezervacija Otkazana - ${bookingData.apartmentName}`,
			html: createGuestCancellationEmail(bookingData),
			plain: htmlToPlain(createGuestCancellationEmail(bookingData)),
		});

		return {
			success: true,
			emailId: result,
		};
	} catch (error) {
		const errorMsg = getMailerooErrorMessage(error);
		console.error("Maileroo cancellation email error:", errorMsg);
		logError(error, {
			action: "sendCancellationEmail",
			path: "/admin/bookings",
			metadata: { bookingId: bookingData.apartmentName },
		});
		return {
			success: true,
			message: "Status updated, but cancellation email could not be sent.",
		};
	}
}

export async function sendInquiryEmail(inquiryData: InquiryData) {
	const adminEmail = env.ADMIN_EMAIL_1;
	const fromEmailAddress = env.MAILEROO_FROM_EMAIL || env.RESEND_FROM_EMAIL;

	if (!fromEmailAddress) {
		return {
			success: false,
			error: "No from email configured",
		};
	}

	let client: MailerooClient;
	try {
		client = getMailerooClient();
	} catch (error) {
		logError(error, { action: "sendInquiryEmail", path: "/contact" });
		return {
			success: false,
			error: sanitizeErrorForProduction(error),
		};
	}

	try {
		const fromEmail = new EmailAddress(fromEmailAddress, "Apartmani Todorović");
		const adminEmailObj = new EmailAddress(adminEmail);
		const replyToEmail = new EmailAddress(inquiryData.email);

		const result = await client.sendBasicEmail({
			from: fromEmail,
			to: [adminEmailObj],
			reply_to: replyToEmail,
			subject: `Nova Poruka od ${inquiryData.name}`,
			html: createInquiryEmail(inquiryData),
			plain: htmlToPlain(createInquiryEmail(inquiryData)),
		});

		return {
			success: true,
			emailId: result,
		};
	} catch (error) {
		const errorMsg = getMailerooErrorMessage(error);
		console.error("Maileroo inquiry email error:", errorMsg);
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