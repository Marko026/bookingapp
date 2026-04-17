"use server";

import { z } from "zod";
import { db } from "@/db";
import { inquiries } from "@/db/schema";
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
	return { message: "Message sent successfully!" };
});
