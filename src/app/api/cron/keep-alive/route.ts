import { sql } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { env } from "@/env";
import { handleApiError } from "@/lib/api-error-handler";

// Vercel rute ovog tipa ne smeju biti keširane
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
	const authHeader = request.headers.get("authorization");

	// Proveravamo da li samo naš Vercel Cron ima pristup
	if (authHeader !== `Bearer ${env.CRON_SECRET}`) {
		return new Response("Unauthorized", { status: 401 });
	}

	try {
		// Najlakši upit koji budi bazu i registruje aktivnost na Supabase-u
		await db.execute(sql`SELECT 1`);

		return NextResponse.json({
			success: true,
			message: "Baza je uspešno pingovana kako bi se sprečilo gašenje.",
			timestamp: new Date().toISOString(),
		});
	} catch (error) {
		return handleApiError(error, {
			path: "/api/cron/keep-alive",
			action: "keepAlivePing",
		});
	}
}
