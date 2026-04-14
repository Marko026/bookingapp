"use server";

import { translateToEnglish } from "@/lib/translator";

export async function translateText(text: string): Promise<string> {
	if (!text || text.trim().length === 0) {
		return "";
	}

	try {
		const translated = await translateToEnglish(text);
		return translated;
	} catch (error) {
		console.error("Translation error:", error);
		throw new Error("Translation failed. Please try again.");
	}
}
