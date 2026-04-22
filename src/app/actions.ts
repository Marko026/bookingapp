"use server";

import { z } from "zod";
import { db } from "@/db";
import { inquiries } from "@/db/schema";
import { sendInquiryEmail } from "@/lib/email";
import { createSafeAction } from "@/lib/safe-action";

const contactSchema = z.object({
	name: z.string().min(2, "Name must be at least 2 characters").max(200),
	email: z.string().email("Invalid email address").max(255),
	message: z
		.string()
		.min(10, "Message must be at least 10 characters")
		.max(5000),
});

// Server Actions

export const submitInquiry = createSafeAction(contactSchema, async (data) => {
	await db.insert(inquiries).values(data);

	try {
		await sendInquiryEmail({
			name: data.name,
			email: data.email,
			message: data.message,
		});
	} catch (_emailError) {
		// Email failure should not block the user from seeing success
		console.error("Inquiry email failed:", _emailError);
	}

	return { message: "Message sent successfully!" };
});
