"use server";

import { z } from "zod";
import { db } from "@/db";
import { inquiries } from "@/db/schema";
import { createSafeAction } from "@/lib/safe-action";

const contactSchema = z.object({
	name: z.string().min(2, "Name must be at least 2 characters"),
	email: z.string().email("Invalid email address"),
	message: z.string().min(10, "Message must be at least 10 characters"),
});

// Server Actions

export const submitInquiry = createSafeAction(contactSchema, async (data) => {
	await db.insert(inquiries).values(data);
	return { message: "Message sent successfully!" };
});
